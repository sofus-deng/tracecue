'use client';

import {
  Accordion,
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Code,
  Container,
  Divider,
  Grid,
  Group,
  Kbd,
  Paper,
  Progress,
  RingProgress,
  ScrollArea,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  Textarea,
  ThemeIcon,
  Timeline,
  Title,
  Tooltip,
} from '@mantine/core';
import {
  IconArrowRight,
  IconBarrierBlock,
  IconCheck,
  IconClipboardCheck,
  IconDatabaseExport,
  IconFileText,
  IconGitBranch,
  IconLockCheck,
  IconPlayerPlay,
  IconQrcode,
  IconRoute,
  IconShieldCheck,
  IconSparkles,
  IconUpload,
} from '@tabler/icons-react';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';

import { buildGuideMarkdown } from '@/src/lib/guide-export';
import type {
  GuardedGuideCard,
  GuideGenerationMeta,
  ProcedureLedger,
  PublishGateStatus,
  ReviewStatus,
  SourceChunk,
  SourceDocument,
} from '@/src/lib/types';
import { buildProcedureLedger, guardCards } from '@/src/lib/guards';

const statusColor = {
  publishable: 'green',
  needs_review: 'yellow',
  blocked: 'red',
} as const;

type DemoReviewAction = 'approved' | 'needs_expert_review' | 'blocked';

type DemoReviewDecision = {
  action: DemoReviewAction;
  label: string;
  reason: string;
  decidedAt: string;
  sessionOnly: true;
};

const reviewActionLabels = {
  approved: 'Approved',
  needs_expert_review: 'Needs expert review',
  blocked: 'Blocked',
} as const satisfies Record<DemoReviewAction, string>;

const reviewActionColors = {
  approved: 'green',
  needs_expert_review: 'yellow',
  blocked: 'red',
} as const satisfies Record<DemoReviewAction, string>;

const reviewStatusLabels = {
  approved: 'Approved',
  pending: 'Needs expert review',
  edited: 'Edited',
  rejected: 'Blocked',
} as const satisfies Record<ReviewStatus, string>;

type TraceCueDashboardProps = {
  generationMeta: GuideGenerationMeta;
  guardedCards: GuardedGuideCard[];
  ledger: ProcedureLedger;
  sourceChunks: SourceChunk[];
  sourceDocuments: SourceDocument[];
};

type RunDemoResponse = TraceCueDashboardProps;

const generationStatus = {
  deterministic_fallback: { label: 'Deterministic standby', color: 'gray' },
  qwen_live: { label: 'Qwen live', color: 'teal' },
  qwen_unconfigured_fallback: { label: 'Qwen unconfigured', color: 'yellow' },
  qwen_failed_fallback: { label: 'Qwen fallback', color: 'red' },
  qwen_quota_paused: { label: 'Paused - no free quota', color: 'red' },
} as const;

function notificationTone(mode: GuideGenerationMeta['mode']) {
  if (mode === 'qwen_live') {
    return {
      title: 'Qwen live generation succeeded',
      color: 'green',
    } as const;
  }

  if (mode === 'qwen_quota_paused') {
    return {
      title: 'Live generation paused',
      color: 'red',
    } as const;
  }

  return {
    title: 'Demo run completed with fallback',
    color: 'yellow',
  } as const;
}

function reviewStatusForAction(action: DemoReviewAction): ReviewStatus {
  if (action === 'approved') {
    return 'approved';
  }

  if (action === 'blocked') {
    return 'rejected';
  }

  return 'pending';
}

function localPublishGateForReview(card: GuardedGuideCard): { status: PublishGateStatus; reason: string } {
  if (card.reviewStatus === 'rejected') {
    return { status: 'blocked', reason: 'Reviewer blocked this card for the current demo session.' };
  }

  if (card.sourceRefs.length === 0 || card.sourceGuardStatus !== 'grounded') {
    return {
      status: 'blocked',
      reason: 'Approval cannot override Source Guard. Missing or invalid source references keep this card blocked.',
    };
  }

  if (card.riskFlags.some((flag) => flag.severity === 'high')) {
    return {
      status: 'needs_review',
      reason: 'Approval cannot override high-severity Risk Guard. Expert review or source/risk fixes are required before QR publication.',
    };
  }

  if (card.reviewStatus !== 'approved') {
    return { status: 'needs_review', reason: 'Card is held for expert review in this demo session.' };
  }

  return { status: 'publishable', reason: 'Approved, source-grounded, and clear of high-severity risk flags.' };
}

function applyLocalReviewGate(cards: GuardedGuideCard[]): GuardedGuideCard[] {
  return cards.map((card) => {
    const localGate = localPublishGateForReview(card);

    return {
      ...card,
      publishGateStatus: localGate.status,
      publishGateReason: localGate.reason,
    };
  });
}

export function TraceCueDashboard({
  generationMeta: initialGenerationMeta,
  guardedCards: initialGuardedCards,
  ledger: initialLedger,
  sourceChunks,
  sourceDocuments,
}: TraceCueDashboardProps) {
  const [feedback, setFeedback] = useState('Step 3 is unclear. How do I confirm the filter reset worked?');
  const [currentGenerationMeta, setCurrentGenerationMeta] = useState(initialGenerationMeta);
  const [currentGuardedCards, setCurrentGuardedCards] = useState(initialGuardedCards);
  const [currentLedger, setCurrentLedger] = useState(initialLedger);
  const [reviewDecisions, setReviewDecisions] = useState<Record<string, DemoReviewDecision>>({});
  const [isRunningDemo, setIsRunningDemo] = useState(false);
  const publishable = currentGuardedCards.filter((card) => card.publishGateStatus === 'publishable');
  const blocked = currentGuardedCards.filter((card) => card.publishGateStatus === 'blocked');
  const needsReview = currentGuardedCards.filter((card) => card.publishGateStatus === 'needs_review');
  const withheldFromPreview = [...needsReview, ...blocked];
  const currentGenerationStatus = generationStatus[currentGenerationMeta.mode];

  async function runDemoSlice() {
    setIsRunningDemo(true);

    try {
      const response = await fetch('/api/run-demo', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Run Qwen pass request failed with HTTP ${response.status}.`);
      }

      const payload = (await response.json()) as RunDemoResponse;
      const tone = notificationTone(payload.generationMeta.mode);

      setCurrentGenerationMeta(payload.generationMeta);
      const locallyGuardedCards = applyLocalReviewGate(payload.guardedCards);

      setCurrentGuardedCards(locallyGuardedCards);
      setCurrentLedger(buildProcedureLedger(locallyGuardedCards));
      setReviewDecisions({});

      notifications.show({
        title: tone.title,
        message: payload.generationMeta.reason,
        color: tone.color,
        icon: payload.generationMeta.mode === 'qwen_live' ? <IconCheck size={16} /> : undefined,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Run Qwen pass request failed for an unknown reason.';

      notifications.show({
        title: 'Run Qwen pass failed',
        message,
        color: 'red',
      });
    } finally {
      setIsRunningDemo(false);
    }
  }

  function exportLedgerJson() {
    const exportPayload = {
      generatedAt: new Date().toISOString(),
      demoName: 'equipment-after-sales-qr-guide',
      generationMeta: currentGenerationMeta,
      procedureLedger: currentLedger,
      sourceDocuments,
      sourceChunks,
      guardedGuideCards: currentGuardedCards,
      publishGateSummary: {
        status: currentLedger.publishStatus,
        publishableCount: publishable.length,
        needsReviewCount: needsReview.length,
        blockedCount: blocked.length,
        publishableStepIds: publishable.map((card) => card.id),
        needsReviewStepIds: needsReview.map((card) => card.id),
        blockedStepIds: blocked.map((card) => card.id),
        reviewActionsAreSessionOnly: true,
        approvalsDoNotOverrideSourceOrRiskGuards: true,
      },
      reviewSession: {
        scope: 'demo_local_browser_session',
        persistentStorage: false,
        decisions: reviewDecisions,
        safetyPolicy:
          'Reviewer approval updates reviewStatus only. Source Guard, high-severity Risk Guard, and explicit blocked decisions still control QR publication.',
      },
      revisionProposal: currentLedger.revisionProposal,
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'tracecue-ledger-equipment-after-sales-v1.json';
    link.click();
    URL.revokeObjectURL(url);

    notifications.show({
      title: 'Ledger exported',
      message: 'Downloaded tracecue-ledger-equipment-after-sales-v1.json',
      color: 'green',
      icon: <IconCheck size={16} />,
    });
  }

  function exportGuideMarkdown() {
    const markdown = buildGuideMarkdown({
      exportedAt: new Date().toISOString(),
      generationMeta: currentGenerationMeta,
      guardedCards: currentGuardedCards,
      ledger: currentLedger,
      reviewDecisions,
      sourceChunks,
      sourceDocuments,
    });
    const blob = new Blob([markdown], {
      type: 'text/markdown;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'tracecue-guide-equipment-after-sales-v1.md';
    link.click();
    URL.revokeObjectURL(url);

    notifications.show({
      title: 'Guide Markdown exported',
      message: 'Downloaded tracecue-guide-equipment-after-sales-v1.md',
      color: 'green',
      icon: <IconCheck size={16} />,
    });
  }

  function applyReviewAction(card: GuardedGuideCard, action: DemoReviewAction) {
    const updatedReviewStatus = reviewStatusForAction(action);
    const reviewedCards = currentGuardedCards.map((candidate) =>
      candidate.id === card.id
        ? {
            ...candidate,
            reviewStatus: updatedReviewStatus,
          }
        : candidate,
    );
    const nextGuardedCards = applyLocalReviewGate(guardCards(reviewedCards));
    const nextCard = nextGuardedCards.find((candidate) => candidate.id === card.id);
    const decision: DemoReviewDecision = {
      action,
      label: reviewActionLabels[action],
      reason: nextCard?.publishGateReason ?? 'Review action applied in the current demo session.',
      decidedAt: new Date().toISOString(),
      sessionOnly: true,
    };

    setCurrentGuardedCards(nextGuardedCards);
    setCurrentLedger(buildProcedureLedger(nextGuardedCards));
    setReviewDecisions((previous) => ({
      ...previous,
      [card.id]: decision,
    }));

    notifications.show({
      title: `${reviewActionLabels[action]} recorded`,
      message: decision.reason,
      color: reviewActionColors[action],
      icon: action === 'approved' ? <IconCheck size={16} /> : undefined,
    });
  }

  return (
    <Box className="trace-shell" pos="relative">
      <Box className="trace-orb" />
      <Container size="xl">
        <Paper className="trace-glass trace-workbench" radius="md" p={{ base: 'lg', md: 28 }}>
          <Stack gap="lg">
            <Group justify="space-between" align="flex-start" gap="md">
              <Group gap="xs">
                <Badge variant="filled" color="dark" size="lg" leftSection={<IconSparkles size={14} />}>
                  WorkCue Open
                </Badge>
                <Badge variant="outline" color="dark" size="lg">
                  TraceCue Agent
                </Badge>
                <Tooltip label={`${currentGenerationMeta.reason} Model: ${currentGenerationMeta.model}`} multiline w={360}>
                  <Badge variant="light" color={currentGenerationStatus.color} size="lg">
                    {currentGenerationStatus.label}
                  </Badge>
                </Tooltip>
              </Group>
              <Group gap="xs">
                <Button
                  size="sm"
                  radius="md"
                  leftSection={<IconPlayerPlay size={16} />}
                  color="teal"
                  loading={isRunningDemo}
                  onClick={runDemoSlice}
                >
                  {isRunningDemo ? 'Running Qwen' : 'Run Qwen pass'}
                </Button>
                <Button
                  size="sm"
                  radius="md"
                  variant="default"
                  leftSection={<IconFileText size={16} />}
                  onClick={exportGuideMarkdown}
                >
                  Export guide Markdown
                </Button>
                <Button
                  size="sm"
                  radius="md"
                  variant="default"
                  leftSection={<IconDatabaseExport size={16} />}
                  onClick={exportLedgerJson}
                >
                  Export ledger
                </Button>
              </Group>
            </Group>

            <Grid align="stretch">
              <Grid.Col span={{ base: 12, md: 8 }}>
                <Stack gap="md" className="trace-ledger-strip" pl="md">
                  <Text className="trace-kicker" size="xs" fw={800}>
                    Evidence console / publish gate
                  </Text>
                  <Title order={1} fz={{ base: 34, md: 54 }} lh={1.02}>
                    Every instruction leaves a trail.
                  </Title>
                  <Text c="dimmed" fz={{ base: 'md', md: 'lg' }} maw={760}>
                    TraceCue turns messy after-sales source material into source-grounded QR guide cards, then proves which cards can ship, which need review, and which must stop.
                  </Text>
                  <Group gap="xs">
                    <Kbd className="trace-evidence-code">Equipment After-sales QR Guide</Kbd>
                    <Kbd className="trace-evidence-code">ProcedureLedger v1.0</Kbd>
                    <Kbd className="trace-evidence-code">Model: {currentGenerationMeta.model}</Kbd>
                  </Group>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Paper className="trace-subtle-panel" radius="md" p="md" h="100%">
                  <Group justify="space-between" align="flex-start">
                    <Stack gap={4}>
                      <Text size="xs" fw={800} c="dimmed" tt="uppercase">Source coverage</Text>
                      <Text fz={42} fw={850}>{currentLedger.sourceCoverage}%</Text>
                      <Text size="sm" c="dimmed">{currentLedger.reviewSummary}</Text>
                    </Stack>
                    <RingProgress
                      size={96}
                      thickness={10}
                      roundCaps
                      sections={[{ value: currentLedger.sourceCoverage, color: 'teal' }]}
                      label={<Text ta="center" size="xs" fw={800}>TRACE</Text>}
                    />
                  </Group>
                  <Divider my="md" className="trace-rule" />
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Publish state</Text>
                    <Badge color={currentLedger.publishStatus === 'approved' ? 'green' : 'yellow'} variant="filled">
                      {currentLedger.publishStatus}
                    </Badge>
                  </Group>
                </Paper>
              </Grid.Col>
            </Grid>

            {currentGenerationMeta.mode === 'qwen_quota_paused' ? (
              <Alert color="red" radius="md" title="Live generation paused">
                {currentGenerationMeta.reason}
              </Alert>
            ) : null}

            <SimpleGrid cols={{ base: 2, md: 4 }} spacing="sm">
              <MetricCard icon={<IconFileText size={18} />} label="Source chunks" value={String(sourceChunks.length)} />
              <MetricCard icon={<IconShieldCheck size={18} />} label="Needs review" value={String(needsReview.length)} tone="yellow" />
              <MetricCard icon={<IconBarrierBlock size={18} />} label="Blocked" value={String(blocked.length)} tone="red" />
              <MetricCard icon={<IconCheck size={18} />} label="Publishable" value={String(publishable.length)} tone="green" />
            </SimpleGrid>
          </Stack>
        </Paper>

        <Grid mt="md">
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Stack gap="md">
              <Card className="trace-glass" radius="md" p="md">
                <Group justify="space-between">
                  <Stack gap={2}>
                    <Text className="trace-kicker" fz="xs" fw={800}>Sources</Text>
                    <Title order={2} fz="xl">Input pack</Title>
                  </Stack>
                  <ThemeIcon variant="filled" color="dark" radius="md" size="lg">
                    <IconRoute size={18} />
                  </ThemeIcon>
                </Group>
                <Text c="dimmed" mt="xs" size="sm">
                  Synthetic after-sales documents become grounded source chunks. The demo avoids real customer or equipment-owner data.
                </Text>
                <Accordion variant="contained" mt="md" radius="md">
                  {sourceDocuments.map((doc) => (
                    <Accordion.Item key={doc.id} value={doc.id}>
                      <Accordion.Control>
                        <Group gap="xs">
                          <Badge color="gray" variant="light">{doc.kind}</Badge>
                          <Text fw={650}>{doc.title}</Text>
                        </Group>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Text c="dimmed" size="sm">{doc.excerpt}</Text>
                      </Accordion.Panel>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </Card>

              <Card className="trace-glass" radius="md" p="md">
                <Group justify="space-between">
                  <Stack gap={2}>
                    <Text className="trace-kicker" fz="xs" fw={800}>Ledger</Text>
                    <Title order={2} fz="xl">ProcedureLedger</Title>
                  </Stack>
                  <ThemeIcon variant="light" color="teal" radius="md" size="lg">
                    <IconGitBranch size={18} />
                  </ThemeIcon>
                </Group>
                <Timeline color="teal" active={4} bulletSize={24} lineWidth={2} mt="md">
                  <Timeline.Item bullet={<IconFileText size={13} />} title="Source snapshot">
                    <Text size="sm" c="dimmed">{sourceChunks.length} chunks captured from synthetic inputs.</Text>
                  </Timeline.Item>
                  <Timeline.Item bullet={<IconShieldCheck size={13} />} title="Guard results">
                    <Text size="sm" c="dimmed">{currentLedger.riskFlagCount} risk flags, {currentLedger.missingSourceStepIds.length} missing-source step.</Text>
                  </Timeline.Item>
                  <Timeline.Item bullet={<IconClipboardCheck size={13} />} title="Review state">
                    <Text size="sm" c="dimmed">{currentLedger.reviewSummary}</Text>
                  </Timeline.Item>
                  <Timeline.Item bullet={<IconLockCheck size={13} />} title="Publish state">
                    <Text size="sm" c="dimmed">Current status: {currentLedger.publishStatus}</Text>
                  </Timeline.Item>
                  <Timeline.Item bullet={<IconArrowRight size={13} />} title="Revision target">
                    <Text size="sm" c="dimmed">{currentLedger.revisionProposal}</Text>
                  </Timeline.Item>
                </Timeline>
              </Card>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Tabs defaultValue="cards" variant="pills" radius="md">
              <Tabs.List>
                <Tabs.Tab value="cards" leftSection={<IconShieldCheck size={16} />}>Guide cards</Tabs.Tab>
                <Tabs.Tab value="publish" leftSection={<IconLockCheck size={16} />}>Publish Gate</Tabs.Tab>
                <Tabs.Tab value="qr-preview" leftSection={<IconQrcode size={16} />}>QR Preview</Tabs.Tab>
                <Tabs.Tab value="revision" leftSection={<IconSparkles size={16} />}>Revision</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="cards" pt="md">
                <Stack gap="md">
                  <Alert color="blue" radius="md" title="Session-only reviewer controls">
                    Review actions update this local demo session and the exported ledger JSON only. Approval does not override Source Guard, high-severity Risk Guard, or an explicit blocked decision.
                  </Alert>
                  <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                    {currentGuardedCards.map((card) => (
                    <Card key={card.id} className="trace-glass" radius="md" p="md">
                      <Stack gap="sm">
                        <Group justify="space-between" align="start">
                          <Group gap="xs" align="start">
                            <Badge className="trace-card-index" variant="filled">{String(card.order).padStart(2, '0')}</Badge>
                            <Stack gap={2} maw="78%">
                              <Title order={3} fz="lg">{card.title}</Title>
                              <Text c="dimmed" size="sm">{card.purpose}</Text>
                            </Stack>
                          </Group>
                          <Tooltip label={card.publishGateReason} multiline w={260}>
                            <Badge color={statusColor[card.publishGateStatus]} variant="filled">
                              {card.publishGateStatus.replace('_', ' ')}
                            </Badge>
                          </Tooltip>
                        </Group>

                        <Divider className="trace-rule" />
                        <Stack gap={7}>
                          {card.instructions.map((item) => (
                            <Group key={item} gap="sm" align="start" wrap="nowrap">
                              <ThemeIcon size="sm" radius="md" color="teal" variant="light"><IconCheck size={12} /></ThemeIcon>
                              <Text size="sm">{item}</Text>
                            </Group>
                          ))}
                        </Stack>

                        <Alert radius="md" color="gray" variant="light" title="Completion check">
                          {card.completionCheck}
                        </Alert>

                        <Group gap="xs">
                          {card.sourceRefs.length > 0 ? card.sourceRefs.map((ref) => (
                            <Badge key={ref} className="trace-source-pill" variant="outline">
                              {ref}
                            </Badge>
                          )) : <Badge color="red" variant="light">No source reference</Badge>}
                        </Group>

                        <Group gap="xs">
                          <Badge color={card.reviewStatus === 'approved' ? 'green' : card.reviewStatus === 'rejected' ? 'red' : 'yellow'} variant="light">
                            Review: {reviewStatusLabels[card.reviewStatus]}
                          </Badge>
                          <Badge color={card.sourceGuardStatus === 'grounded' ? 'green' : 'red'} variant="light">
                            Source: {card.sourceGuardStatus.replace('_', ' ')}
                          </Badge>
                          {card.riskFlags.length === 0 ? (
                            <Badge color="green" variant="light">No risk flags</Badge>
                          ) : card.riskFlags.map((flag) => (
                            <Badge key={`${card.id}-${flag.type}`} color={flag.severity === 'high' ? 'red' : 'yellow'} variant="light">
                              {flag.type}
                            </Badge>
                          ))}
                        </Group>

                        <ReviewActions
                          card={card}
                          decision={reviewDecisions[card.id]}
                          onDecision={applyReviewAction}
                        />
                      </Stack>
                    </Card>
                    ))}
                  </SimpleGrid>
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="publish" pt="md">
                <Card className="trace-glass" radius="md" p="md">
                  <Stack gap="md">
                    <Group justify="space-between" align="start">
                      <Stack gap={4}>
                        <Text className="trace-kicker" fz="xs" fw={800}>Publish Gate</Text>
                        <Title order={2} fz="xl">Unsupported instructions stop here.</Title>
                      <Text c="dimmed" maw={720} size="sm">
                        TraceCue separates source-grounded cards from risky or unsupported text before the QR guide reaches frontline users.
                      </Text>
                      <Text c="dimmed" maw={720} size="sm">
                        Current review decisions are local to this demo session. Approval never bypasses Source Guard, high-severity Risk Guard, or an explicit blocked decision.
                      </Text>
                    </Stack>
                      <ThemeIcon radius="md" variant="filled" color="dark" size="lg">
                        <IconLockCheck size={20} />
                      </ThemeIcon>
                    </Group>

                    <SimpleGrid cols={{ base: 1, md: 3 }}>
                      <GateColumn title="Publishable" color="green" count={publishable.length} cards={publishable.map((card) => card.title)} />
                      <GateColumn title="Needs Review" color="yellow" count={needsReview.length} cards={needsReview.map((card) => card.title)} />
                      <GateColumn title="Blocked" color="red" count={blocked.length} cards={blocked.map((card) => card.title)} />
                    </SimpleGrid>
                  </Stack>
                </Card>
              </Tabs.Panel>

              <Tabs.Panel value="qr-preview" pt="md">
                <Card className="trace-glass" radius="md" p="md">
                  <Stack gap="md">
                    <Group justify="space-between" align="start">
                      <Stack gap={4}>
                        <Text className="trace-kicker" fz="xs" fw={800}>QR guide workbench</Text>
                        <Title order={2} fz="xl">Frontline mobile preview</Title>
                        <Text c="dimmed" maw={720} size="sm">
                          This preview shows the guide a frontline user could open after scanning a QR code. It is derived from the current guarded cards and ProcedureLedger state.
                        </Text>
                      </Stack>
                      <ThemeIcon radius="md" variant="filled" color="dark" size="lg">
                        <IconQrcode size={20} />
                      </ThemeIcon>
                    </Group>

                    <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                      <Paper className="trace-subtle-panel" radius="md" p="md">
                        <Text size="xs" c="dimmed" tt="uppercase" fw={800}>Included in QR guide</Text>
                        <Text fz={30} fw={850}>{publishable.length}</Text>
                        <Text size="sm" c="dimmed">Publishable, reviewed steps shown to frontline users.</Text>
                      </Paper>
                      <Paper className="trace-subtle-panel" radius="md" p="md">
                        <Text size="xs" c="dimmed" tt="uppercase" fw={800}>Held for review</Text>
                        <Text fz={30} fw={850}>{needsReview.length}</Text>
                        <Text size="sm" c="dimmed">Review-only steps stay out of the mobile guide.</Text>
                      </Paper>
                      <Paper className="trace-subtle-panel" radius="md" p="md">
                        <Text size="xs" c="dimmed" tt="uppercase" fw={800}>Blocked from QR</Text>
                        <Text fz={30} fw={850}>{blocked.length}</Text>
                        <Text size="sm" c="dimmed">Unsupported or ungrounded instructions are withheld.</Text>
                      </Paper>
                    </SimpleGrid>

                    <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
                      <Stack gap="md">
                        <Paper className="trace-subtle-panel" radius="md" p="md">
                          <Group justify="space-between" align="start">
                            <Stack gap={4}>
                              <Text size="xs" c="dimmed" tt="uppercase" fw={800}>QR entry point</Text>
                              <Title order={3} fz="lg">Equipment guide link</Title>
                              <Text size="sm" c="dimmed">
                                Placeholder only: QR rendering and image decoding are planned follow-up work, not part of this UI slice.
                              </Text>
                            </Stack>
                            <QrPlaceholder />
                          </Group>
                          <Button
                            mt="md"
                            fullWidth
                            variant="default"
                            radius="md"
                            leftSection={<IconUpload size={16} />}
                            disabled
                          >
                            Upload QR image — planned follow-up
                          </Button>
                        </Paper>

                        <Paper className="trace-subtle-panel" radius="md" p="md">
                          <Text size="xs" c="dimmed" tt="uppercase" fw={800}>Withheld notice</Text>
                          <Title order={3} fz="lg" mt={4}>Review gate protects the QR guide.</Title>
                          <Text size="sm" c="dimmed" mt="xs">
                            {withheldFromPreview.length === 0
                              ? 'No cards are currently withheld. The preview includes every guarded guide card.'
                              : `${withheldFromPreview.length} card${withheldFromPreview.length === 1 ? '' : 's'} are withheld until review plus source and safety guards clear them for frontline use.`}
                          </Text>
                          {withheldFromPreview.length > 0 ? (
                            <Stack gap="xs" mt="md">
                              {withheldFromPreview.map((card) => (
                                <Group key={card.id} justify="space-between" gap="sm" wrap="nowrap">
                                  <Text size="sm" lineClamp={1}>{card.title}</Text>
                                  <Badge color={statusColor[card.publishGateStatus]} variant="light">
                                    {card.publishGateStatus.replace('_', ' ')}
                                  </Badge>
                                </Group>
                              ))}
                            </Stack>
                          ) : null}
                        </Paper>
                      </Stack>

                      <Paper radius={32} p="sm" bg="dark" shadow="xl" maw={390} w="100%" mx="auto">
                        <Paper radius={26} p="md" bg="white" mih={680}>
                          <Stack gap="md">
                            <Group justify="space-between" align="start">
                              <Stack gap={2}>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={800}>TraceCue QR Guide</Text>
                                <Title order={3} fz="lg">Equipment after-sales guide</Title>
                                <Text size="xs" c="dimmed">{currentLedger.guideId} · {currentLedger.version}</Text>
                              </Stack>
                              <Badge color={currentLedger.publishStatus === 'approved' ? 'green' : 'yellow'} variant="filled">
                                {currentLedger.publishStatus}
                              </Badge>
                            </Group>

                            <Alert
                              color={blocked.length > 0 ? 'red' : needsReview.length > 0 ? 'yellow' : 'green'}
                              radius="md"
                              title={withheldFromPreview.length > 0 ? 'Some steps are hidden from this QR guide' : 'All steps are cleared for preview'}
                            >
                              {withheldFromPreview.length > 0
                                ? `${needsReview.length} need review and ${blocked.length} are blocked before frontline release.`
                                : 'No guarded cards are currently withheld by the publish gate.'}
                            </Alert>

                            <Group grow gap="xs">
                              <Paper p="xs" radius="md" withBorder>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={800}>Coverage</Text>
                                <Text fw={850}>{currentLedger.sourceCoverage}%</Text>
                              </Paper>
                              <Paper p="xs" radius="md" withBorder>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={800}>Mode</Text>
                                <Text fw={850} size="sm" lineClamp={1}>{currentGenerationStatus.label}</Text>
                              </Paper>
                            </Group>

                            <Divider />

                            <ScrollArea h={390} offsetScrollbars>
                              <Stack gap="sm" pr="xs">
                                {publishable.length > 0 ? publishable.map((card) => (
                                  <Paper key={card.id} p="sm" radius="md" withBorder>
                                    <Stack gap="xs">
                                      <Group gap="xs" align="start" wrap="nowrap">
                                        <Badge className="trace-card-index" variant="filled">{String(card.order).padStart(2, '0')}</Badge>
                                        <Stack gap={2}>
                                          <Text fw={800} size="sm">{card.title}</Text>
                                          <Text c="dimmed" size="xs">{card.purpose}</Text>
                                        </Stack>
                                      </Group>
                                      <Stack gap={6}>
                                        {card.instructions.map((item) => (
                                          <Group key={item} gap="xs" align="start" wrap="nowrap">
                                            <ThemeIcon size="xs" radius="md" color="teal" variant="light"><IconCheck size={10} /></ThemeIcon>
                                            <Text size="xs">{item}</Text>
                                          </Group>
                                        ))}
                                      </Stack>
                                      <Paper p="xs" radius="md" bg="gray.0">
                                        <Text size="xs" fw={700}>Completion check</Text>
                                        <Text size="xs" c="dimmed">{card.completionCheck}</Text>
                                      </Paper>
                                      <Group gap={4}>
                                        {card.sourceRefs.map((ref) => (
                                          <Badge key={ref} className="trace-source-pill" variant="outline" size="xs">
                                            {ref}
                                          </Badge>
                                        ))}
                                      </Group>
                                    </Stack>
                                  </Paper>
                                )) : (
                                  <Alert color="red" radius="md" title="No publishable steps">
                                    The publish gate is withholding every card, so the frontline QR guide has no actionable instructions yet.
                                  </Alert>
                                )}
                              </Stack>
                            </ScrollArea>

                            <Paper p="sm" radius="md" bg="gray.0">
                              <Group justify="space-between" gap="xs">
                                <Stack gap={0}>
                                  <Text size="xs" c="dimmed" tt="uppercase" fw={800}>Proof trail</Text>
                                  <Text size="xs" c="dimmed">Model: {currentGenerationMeta.model}</Text>
                                </Stack>
                                <Badge color={currentGenerationStatus.color} variant="light">
                                  {currentGenerationMeta.mode.replaceAll('_', ' ')}
                                </Badge>
                              </Group>
                            </Paper>
                          </Stack>
                        </Paper>
                      </Paper>
                    </SimpleGrid>
                  </Stack>
                </Card>
              </Tabs.Panel>

              <Tabs.Panel value="revision" pt="md">
                <Card className="trace-glass" radius="md" p="md">
                  <Text className="trace-kicker" fz="xs" fw={800}>Feedback to v1.1</Text>
                  <Title order={2} fz="xl">Revision proposal</Title>
                  <Text c="dimmed" mt="xs" size="sm">
                    The demo includes one feedback item to prove the guide is updateable, not static AI text.
                  </Text>
                  <Textarea
                    mt="md"
                    label="Sample feedback"
                    autosize
                    minRows={3}
                    value={feedback}
                    onChange={(event) => setFeedback(event.currentTarget.value)}
                  />
                  <Paper mt="md" p="md" radius="md" className="trace-subtle-panel">
                    <Group justify="space-between">
                      <Badge color="teal" variant="filled">v1.1 proposal</Badge>
                      <Badge color="gray" variant="outline">Recorded in ProcedureLedger</Badge>
                    </Group>
                    <Text mt="md" size="sm">
                      Clarify Step 3 by adding a concrete reset check: <Code>FILTER-90 clears + normal airflow resumes within one minute</Code>. Keep source reference <Code>filter-replacement#03</Code>.
                    </Text>
                  </Paper>
                </Card>
              </Tabs.Panel>
            </Tabs>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
}

function QrPlaceholder() {
  const cells = [1, 2, 3, 5, 8, 10, 11, 13, 16, 17, 19, 21, 22, 24, 27, 30];

  return (
    <Paper p={6} radius="md" bg="white" withBorder aria-label="QR code placeholder">
      <SimpleGrid cols={6} spacing={2} w={78}>
        {Array.from({ length: 36 }, (_, index) => (
          <Box key={index} h={10} bg={cells.includes(index) ? 'dark' : 'gray.1'} />
        ))}
      </SimpleGrid>
    </Paper>
  );
}

function MetricCard({ icon, label, value, tone = 'teal' }: { icon: React.ReactNode; label: string; value: string; tone?: string }) {
  return (
    <Card className="trace-glass" radius="md" p="md">
      <Group justify="space-between">
        <Stack gap={2}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={800}>{label}</Text>
          <Text fz={30} fw={850}>{value}</Text>
        </Stack>
        <ThemeIcon color={tone} variant="light" radius="md" size="lg">
          {icon}
        </ThemeIcon>
      </Group>
    </Card>
  );
}

function ReviewActions({
  card,
  decision,
  onDecision,
}: {
  card: GuardedGuideCard;
  decision: DemoReviewDecision | undefined;
  onDecision: (card: GuardedGuideCard, action: DemoReviewAction) => void;
}) {
  const hasHighSeverityRisk = card.riskFlags.some((flag) => flag.severity === 'high');
  const approvalBlockedByGuard = card.sourceGuardStatus !== 'grounded' || card.sourceRefs.length === 0 || hasHighSeverityRisk;

  return (
    <Paper p="sm" radius="md" className="trace-subtle-panel">
      <Stack gap="xs">
        <Group justify="space-between" gap="xs" align="start">
          <Stack gap={2}>
            <Text size="xs" c="dimmed" tt="uppercase" fw={800}>Review action</Text>
            <Text size="sm" c="dimmed">
              Session-only decision; approval cannot override source or safety guards.
            </Text>
          </Stack>
          {decision ? (
            <Badge color={reviewActionColors[decision.action]} variant="filled">
              {decision.label}
            </Badge>
          ) : (
            <Badge color="gray" variant="light">No action</Badge>
          )}
        </Group>

        <Group gap="xs">
          <Button size="xs" radius="md" color="green" variant="light" onClick={() => onDecision(card, 'approved')}>
            Approved
          </Button>
          <Button size="xs" radius="md" color="yellow" variant="light" onClick={() => onDecision(card, 'needs_expert_review')}>
            Needs expert review
          </Button>
          <Button size="xs" radius="md" color="red" variant="light" onClick={() => onDecision(card, 'blocked')}>
            Blocked
          </Button>
        </Group>

        {approvalBlockedByGuard ? (
          <Text size="xs" c="dimmed">
            Approval is recorded as review intent, but this card remains withheld while Source Guard is not grounded or high-severity risk flags remain.
          </Text>
        ) : null}
      </Stack>
    </Paper>
  );
}

function GateColumn({ title, color, count, cards }: { title: string; color: string; count: number; cards: string[] }) {
  return (
    <Paper p="md" radius="md" className="trace-subtle-panel">
      <Group justify="space-between">
        <Text fw={800}>{title}</Text>
        <Badge color={color}>{count}</Badge>
      </Group>
      <Progress mt="sm" value={Math.min(100, count * 22)} color={color} radius="md" />
      <ScrollArea h={168} mt="md">
        <Stack gap="xs">
          {cards.length > 0 ? cards.map((card) => (
            <Paper key={card} p="xs" radius="md" bg="white" withBorder>
              <Text size="sm">{card}</Text>
            </Paper>
          )) : <Text size="sm" c="dimmed">No cards in this state.</Text>}
        </Stack>
      </ScrollArea>
    </Paper>
  );
}
