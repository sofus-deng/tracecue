'use client';

import {
  Accordion,
  ActionIcon,
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
  deterministic_fallback: { label: 'Generation: deterministic fallback', color: 'gray' },
  qwen_live: { label: 'Generation: Qwen live', color: 'green' },
  qwen_unconfigured_fallback: { label: 'Generation: Qwen unconfigured -> fallback', color: 'yellow' },
  qwen_failed_fallback: { label: 'Generation: Qwen failed -> fallback', color: 'red' },
} as const;

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

      setCurrentGenerationMeta(payload.generationMeta);
      setCurrentGuardedCards(payload.guardedCards);
      setCurrentLedger(payload.ledger);

      notifications.show({
        title: payload.generationMeta.mode === 'qwen_live' ? 'Qwen live generation succeeded' : 'Demo run completed with fallback',
        message: payload.generationMeta.reason,
        color: payload.generationMeta.mode === 'qwen_live' ? 'green' : 'yellow',
        icon: <IconCheck size={16} />,
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
        <Paper className="trace-glass" radius="32px" p={{ base: 'xl', md: 40 }}>
          <Group justify="space-between" align="flex-start" gap="lg">
            <Stack gap="sm" maw={760}>
              <Group gap="xs">
                <Badge variant="light" color="orange" size="lg" leftSection={<IconSparkles size={14} />}>
                  WorkCue Open
                </Badge>
                <Badge variant="outline" color="gray" size="lg">
                  TraceCue Agent
                </Badge>
                <Tooltip label={`${currentGenerationMeta.reason} Model: ${currentGenerationMeta.model}`} multiline w={320}>
                  <Badge variant="light" color={currentGenerationStatus.color} size="lg">
                    {currentGenerationStatus.label}
                  </Badge>
                </Tooltip>
              </Group>
              <Title order={1} fz={{ base: 48, md: 78 }} lh={0.92} style={{ letterSpacing: '-0.065em' }}>
                Procedure guides that prove where they came from.
              </Title>
              <Text c="dimmed" fz={{ base: 'lg', md: 22 }} maw={760}>
                A focused hackathon demo for source-grounded guide cards, a ProcedureLedger trail,
                and a Publish Gate that blocks risky or unsupported steps before they become client-facing instructions.
              </Text>
              <Group mt="sm">
                <Button
                  size="md"
                  radius="xl"
                  leftSection={<IconPlayerPlay size={18} />}
                  color="orange"
                  loading={isRunningDemo}
                  onClick={runDemoSlice}
                >
                  {isRunningDemo ? 'Running Qwen...' : 'Run demo slice'}
                </Button>
                <Button
                  size="md"
                  radius="xl"
                  variant="default"
                  leftSection={<IconDatabaseExport size={18} />}
                  onClick={exportLedgerJson}
                >
                  Export ledger JSON
                </Button>
                <Kbd>Client Handoff</Kbd>
              </Group>
            </Stack>
            <RingProgress
              size={150}
              thickness={14}
              roundCaps
              sections={[{ value: currentLedger.sourceCoverage, color: 'orange' }]}
              label={
                <Stack align="center" gap={0}>
                  <Text fz={28} fw={800}>{currentLedger.sourceCoverage}%</Text>
                  <Text fz="xs" c="dimmed">source coverage</Text>
                </Stack>
              }
            />
          </Group>

          <SimpleGrid cols={{ base: 1, md: 4 }} spacing="md" mt={36}>
            <MetricCard icon={<IconFileText size={20} />} label="Source chunks" value={String(sourceChunks.length)} />
            <MetricCard icon={<IconShieldCheck size={20} />} label="Needs review" value={String(needsReview.length)} tone="yellow" />
            <MetricCard icon={<IconBarrierBlock size={20} />} label="Blocked" value={String(blocked.length)} tone="red" />
            <MetricCard icon={<IconCheck size={20} />} label="Publishable" value={String(publishable.length)} tone="green" />
          </SimpleGrid>
        </Paper>

        <Grid mt="lg">
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Stack>
              <Card className="trace-glass" radius="24px" p="xl">
                <Group justify="space-between">
                  <Stack gap={2}>
                    <Text className="trace-kicker" fz="xs" fw={700}>Sources</Text>
                    <Title order={2}>Input pack</Title>
                  </Stack>
                  <ThemeIcon variant="light" color="orange" radius="xl" size="lg">
                    <IconRoute size={20} />
                  </ThemeIcon>
                </Group>
                <Text c="dimmed" mt="xs">
                  Five synthetic documents become grounded source chunks. No real client data is needed for the demo.
                </Text>
                <Accordion variant="separated" mt="md" radius="lg">
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

              <Card className="trace-glass" radius="24px" p="xl">
                <Group justify="space-between">
                  <Stack gap={2}>
                    <Text className="trace-kicker" fz="xs" fw={700}>Ledger</Text>
                    <Title order={2}>ProcedureLedger</Title>
                  </Stack>
                  <ThemeIcon variant="light" color="violet" radius="xl" size="lg">
                    <IconGitBranch size={20} />
                  </ThemeIcon>
                </Group>
                <Timeline color="orange" active={4} bulletSize={26} lineWidth={2} mt="lg">
                  <Timeline.Item bullet={<IconFileText size={14} />} title="Source snapshot">
                    <Text size="sm" c="dimmed">{sourceChunks.length} chunks captured from synthetic inputs.</Text>
                  </Timeline.Item>
                  <Timeline.Item bullet={<IconShieldCheck size={14} />} title="Guard results">
                    <Text size="sm" c="dimmed">{currentLedger.riskFlagCount} risk flags, {currentLedger.missingSourceStepIds.length} missing-source step.</Text>
                  </Timeline.Item>
                  <Timeline.Item bullet={<IconClipboardCheck size={14} />} title="Review state">
                    <Text size="sm" c="dimmed">{currentLedger.reviewSummary}</Text>
                  </Timeline.Item>
                  <Timeline.Item bullet={<IconLockCheck size={14} />} title="Publish state">
                    <Text size="sm" c="dimmed">Current status: {currentLedger.publishStatus}</Text>
                  </Timeline.Item>
                  <Timeline.Item bullet={<IconArrowRight size={14} />} title="Revision target">
                    <Text size="sm" c="dimmed">{currentLedger.revisionProposal}</Text>
                  </Timeline.Item>
                </Timeline>
              </Card>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Tabs defaultValue="cards" variant="outline" radius="xl">
              <Tabs.List>
                <Tabs.Tab value="cards" leftSection={<IconShieldCheck size={16} />}>Guide cards</Tabs.Tab>
                <Tabs.Tab value="publish" leftSection={<IconLockCheck size={16} />}>Publish Gate</Tabs.Tab>
                <Tabs.Tab value="revision" leftSection={<IconSparkles size={16} />}>Revision</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="cards" pt="md">
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                  {currentGuardedCards.map((card) => (
                    <Card key={card.id} className="trace-glass" radius="24px" p="lg">
                      <Group justify="space-between" align="start">
                        <Stack gap={4} maw="72%">
                          <Group gap="xs">
                            <Badge color="gray" variant="light">Step {card.order}</Badge>
                            <Badge color={card.sourceGuardStatus === 'grounded' ? 'green' : 'yellow'} variant="light">
                              {card.sourceGuardStatus}
                            </Badge>
                          </Group>
                          <Title order={3} fz="xl">{card.title}</Title>
                        </Stack>
                        <Tooltip label={card.publishGateReason} multiline w={260}>
                          <Badge color={statusColor[card.publishGateStatus]} variant="filled">
                            {card.publishGateStatus.replace('_', ' ')}
                          </Badge>
                        </Tooltip>
                      </Group>

                      <Text c="dimmed" mt="sm">{card.purpose}</Text>
                      <Divider my="md" />
                      <Stack gap={6}>
                        {card.instructions.map((item) => (
                          <Group key={item} gap="sm" align="start" wrap="nowrap">
                            <ThemeIcon size="sm" radius="xl" color="orange" variant="light"><IconCheck size={12} /></ThemeIcon>
                            <Text size="sm">{item}</Text>
                          </Group>
                        ))}
                      </Stack>

                      <Alert mt="md" radius="lg" color="gray" variant="light" title="Completion check">
                        {card.completionCheck}
                      </Alert>

                      <Group mt="md" gap="xs">
                        {card.sourceRefs.length > 0 ? card.sourceRefs.map((ref) => (
                          <Badge key={ref} variant="outline" color="orange">{ref}</Badge>
                        )) : <Badge color="red" variant="light">No source reference</Badge>}
                      </Group>

                      <Group mt="md" gap="xs">
                        {card.riskFlags.length === 0 ? (
                          <Badge color="green" variant="light">No risk flags</Badge>
                        ) : card.riskFlags.map((flag) => (
                          <Badge key={`${card.id}-${flag.type}`} color={flag.severity === 'high' ? 'red' : 'yellow'} variant="light">
                            {flag.type}
                          </Badge>
                        ))}
                      </Group>
                    </Card>
                  ))}
                </SimpleGrid>
              </Tabs.Panel>

              <Tabs.Panel value="publish" pt="md">
                <Card className="trace-glass" radius="24px" p="xl">
                  <Group justify="space-between" align="start">
                    <Stack gap={4}>
                      <Text className="trace-kicker" fz="xs" fw={700}>Publish Gate</Text>
                      <Title order={2}>Only reviewed and grounded cards can ship.</Title>
                      <Text c="dimmed" maw={720}>
                        TraceCue blocks unsupported steps and holds risky commitments for review. This is the difference between a document generator and a procedure workflow agent.
                      </Text>
                    </Stack>
                    <ActionIcon radius="xl" variant="light" color="orange" size="xl">
                      <IconLockCheck size={24} />
                    </ActionIcon>
                  </Group>

                  <SimpleGrid cols={{ base: 1, md: 3 }} mt="lg">
                    <GateColumn title="Publishable" color="green" count={publishable.length} cards={publishable.map((card) => card.title)} />
                    <GateColumn title="Needs Review" color="yellow" count={needsReview.length} cards={needsReview.map((card) => card.title)} />
                    <GateColumn title="Blocked" color="red" count={blocked.length} cards={blocked.map((card) => card.title)} />
                  </SimpleGrid>
                </Card>
              </Tabs.Panel>

              <Tabs.Panel value="revision" pt="md">
                <Card className="trace-glass" radius="24px" p="xl">
                  <Text className="trace-kicker" fz="xs" fw={700}>Feedback → v1.1</Text>
                  <Title order={2}>Revision proposal</Title>
                  <Text c="dimmed" mt="xs">
                    The demo includes one feedback item to prove the guide is updateable, not static AI text.
                  </Text>
                  <Textarea
                    mt="lg"
                    label="Sample feedback"
                    autosize
                    minRows={3}
                    value={feedback}
                    onChange={(event) => setFeedback(event.currentTarget.value)}
                  />
                  <Paper mt="lg" p="lg" radius="lg" withBorder bg="rgba(255,255,255,0.04)">
                    <Group justify="space-between">
                      <Badge color="orange" variant="light">v1.1 proposal</Badge>
                      <Badge color="gray" variant="outline">Recorded in ProcedureLedger</Badge>
                    </Group>
                    <Text mt="md">
                      Clarify Step 5 by adding a concrete example: “When reporting a broken form, include the URL, screenshot, device, browser, and what you expected to happen.” Keep source reference <Code>meeting-transcript#01</Code>.
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

function MetricCard({ icon, label, value, tone = 'orange' }: { icon: React.ReactNode; label: string; value: string; tone?: string }) {
  return (
    <Card className="trace-glass" radius="20px" p="lg">
      <Group justify="space-between">
        <Stack gap={2}>
          <Text size="sm" c="dimmed">{label}</Text>
          <Text fz={34} fw={850}>{value}</Text>
        </Stack>
        <ThemeIcon color={tone} variant="light" radius="xl" size="xl">
          {icon}
        </ThemeIcon>
      </Group>
    </Card>
  );
}

function GateColumn({ title, color, count, cards }: { title: string; color: string; count: number; cards: string[] }) {
  return (
    <Paper p="md" radius="lg" withBorder bg="rgba(255,255,255,0.035)">
      <Group justify="space-between">
        <Text fw={750}>{title}</Text>
        <Badge color={color}>{count}</Badge>
      </Group>
      <Progress mt="sm" value={Math.min(100, count * 18)} color={color} radius="xl" />
      <ScrollArea h={170} mt="md">
        <Stack gap="xs">
          {cards.length > 0 ? cards.map((card) => (
            <Paper key={card} p="sm" radius="md" bg="rgba(255,255,255,0.04)">
              <Text size="sm">{card}</Text>
            </Paper>
          )) : <Text size="sm" c="dimmed">No cards in this state.</Text>}
        </Stack>
      </ScrollArea>
    </Paper>
  );
}
