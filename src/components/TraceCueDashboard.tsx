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
  IconRoute,
  IconShieldCheck,
  IconSparkles,
} from '@tabler/icons-react';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';

import type {
  GuardedGuideCard,
  GuideGenerationMeta,
  ProcedureLedger,
  SourceChunk,
  SourceDocument,
} from '@/src/lib/types';

const statusColor = {
  publishable: 'green',
  needs_review: 'yellow',
  blocked: 'red',
} as const;

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

export function TraceCueDashboard({
  generationMeta: initialGenerationMeta,
  guardedCards: initialGuardedCards,
  ledger: initialLedger,
  sourceChunks,
  sourceDocuments,
}: TraceCueDashboardProps) {
  const [feedback, setFeedback] = useState('Step 5 is unclear. What does a good bug report look like?');
  const [currentGenerationMeta, setCurrentGenerationMeta] = useState(initialGenerationMeta);
  const [currentGuardedCards, setCurrentGuardedCards] = useState(initialGuardedCards);
  const [currentLedger, setCurrentLedger] = useState(initialLedger);
  const [isRunningDemo, setIsRunningDemo] = useState(false);
  const publishable = currentGuardedCards.filter((card) => card.publishGateStatus === 'publishable');
  const blocked = currentGuardedCards.filter((card) => card.publishGateStatus === 'blocked');
  const needsReview = currentGuardedCards.filter((card) => card.publishGateStatus === 'needs_review');
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
        throw new Error(`Run demo request failed with HTTP ${response.status}.`);
      }

      const payload = (await response.json()) as RunDemoResponse;
      const tone = notificationTone(payload.generationMeta.mode);

      setCurrentGenerationMeta(payload.generationMeta);
      setCurrentGuardedCards(payload.guardedCards);
      setCurrentLedger(payload.ledger);

      notifications.show({
        title: tone.title,
        message: payload.generationMeta.reason,
        color: tone.color,
        icon: payload.generationMeta.mode === 'qwen_live' ? <IconCheck size={16} /> : undefined,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Run demo request failed for an unknown reason.';

      notifications.show({
        title: 'Run demo failed',
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
      demoName: 'client-handoff',
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
      },
      revisionProposal: currentLedger.revisionProposal,
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'tracecue-ledger-client-handoff-v1.json';
    link.click();
    URL.revokeObjectURL(url);

    notifications.show({
      title: 'Ledger exported',
      message: 'Downloaded tracecue-ledger-client-handoff-v1.json',
      color: 'green',
      icon: <IconCheck size={16} />,
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
                    TraceCue turns scattered operational notes into source-grounded guide cards, then proves which cards can ship, which need review, and which must stop.
                  </Text>
                  <Group gap="xs">
                    <Kbd className="trace-evidence-code">Client Handoff</Kbd>
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
                  Synthetic documents become grounded source chunks. The demo avoids real client data.
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
                <Tabs.Tab value="revision" leftSection={<IconSparkles size={16} />}>Revision</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="cards" pt="md">
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
                          {card.riskFlags.length === 0 ? (
                            <Badge color="green" variant="light">No risk flags</Badge>
                          ) : card.riskFlags.map((flag) => (
                            <Badge key={`${card.id}-${flag.type}`} color={flag.severity === 'high' ? 'red' : 'yellow'} variant="light">
                              {flag.type}
                            </Badge>
                          ))}
                        </Group>
                      </Stack>
                    </Card>
                  ))}
                </SimpleGrid>
              </Tabs.Panel>

              <Tabs.Panel value="publish" pt="md">
                <Card className="trace-glass" radius="md" p="md">
                  <Stack gap="md">
                    <Group justify="space-between" align="start">
                      <Stack gap={4}>
                        <Text className="trace-kicker" fz="xs" fw={800}>Publish Gate</Text>
                        <Title order={2} fz="xl">Unsupported instructions stop here.</Title>
                        <Text c="dimmed" maw={720} size="sm">
                          TraceCue separates source-grounded cards from risky or unsupported text before the guide becomes client-facing.
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
                      Clarify Step 5 by adding a concrete example: <Code>URL + screenshot + device + browser + expected result</Code>. Keep source reference <Code>meeting-transcript#01</Code>.
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
