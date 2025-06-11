
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Container, Stack, Text, Surface, IconButton, Grid } from '@/components/ui/design-system';
import { spacing, borderRadius, typography, shadows } from '@/design/tokens';
import { Palette, Type, Layout, Sparkles } from 'lucide-react';

export const DesignSystemShowcase: React.FC = () => {
  return (
    <Container maxWidth="6xl" padding="xl">
      <Stack gap="6xl">
        {/* Header */}
        <Stack gap="lg" align="center">
          <Text as="h1" size="4xl" weight="bold" variant="gradient" family="display" align="center">
            Design System
          </Text>
          <Text size="lg" variant="muted" align="center">
            A consistent design language for CareerOS
          </Text>
        </Stack>

        {/* Design Tokens */}
        <Stack gap="3xl">
          {/* Spacing Tokens */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Layout className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle>Spacing Tokens</CardTitle>
                  <CardDescription>Consistent spacing values throughout the app</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Grid columns="auto-fit" minItemWidth="120px" gap="lg">
                {Object.entries(spacing).map(([name, value]) => (
                  <Surface key={name} padding="md" variant="outlined" radius="md">
                    <Stack gap="sm" align="center">
                      <div 
                        className="bg-primary rounded"
                        style={{ width: value, height: value, minWidth: '8px', minHeight: '8px' }}
                      />
                      <Text size="sm" weight="medium">{name}</Text>
                      <Text size="xs" variant="muted">{value}</Text>
                    </Stack>
                  </Surface>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Typography Tokens */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Type className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle>Typography Scale</CardTitle>
                  <CardDescription>Font sizes and weights for consistent typography</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Stack gap="lg">
                {Object.entries(typography.fontSize).map(([name, config]) => {
                  const fontSize = Array.isArray(config) ? config[0] : config;
                  return (
                    <Surface key={name} padding="md" variant="ghost">
                      <Stack direction="row" align="center" justify="between">
                        <Text 
                          size={name as any} 
                          weight="medium"
                        >
                          The quick brown fox jumps over the lazy dog
                        </Text>
                        <Stack gap="xs" align="end">
                          <Text size="xs" variant="muted" weight="medium">{name}</Text>
                          <Text size="xs" variant="muted">{fontSize}</Text>
                        </Stack>
                      </Stack>
                    </Surface>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>

          {/* Components */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle>Component Library</CardTitle>
                  <CardDescription>Reusable components built with design tokens</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Stack gap="xl">
                {/* Text Components */}
                <Surface padding="lg" variant="outlined" radius="lg">
                  <Stack gap="md">
                    <Text size="lg" weight="semibold">Text Component Variants</Text>
                    <Stack gap="sm">
                      <Text variant="default">Default text variant</Text>
                      <Text variant="muted">Muted text variant</Text>
                      <Text variant="accent">Accent text variant</Text>
                      <Text variant="gradient" weight="bold">Gradient text variant</Text>
                    </Stack>
                  </Stack>
                </Surface>

                {/* Surface Components */}
                <Stack gap="md">
                  <Text size="lg" weight="semibold">Surface Component Variants</Text>
                  <Grid responsive={{ sm: 1, md: 2, lg: 4 }} gap="lg">
                    <Surface variant="default" padding="lg">
                      <Text weight="medium">Default Surface</Text>
                      <Text size="sm" variant="muted">With shadow and border</Text>
                    </Surface>
                    <Surface variant="elevated" padding="lg">
                      <Text weight="medium">Elevated Surface</Text>
                      <Text size="sm" variant="muted">With enhanced shadow</Text>
                    </Surface>
                    <Surface variant="outlined" padding="lg">
                      <Text weight="medium">Outlined Surface</Text>
                      <Text size="sm" variant="muted">Border only, no background</Text>
                    </Surface>
                    <Surface variant="ghost" padding="lg">
                      <Text weight="medium">Ghost Surface</Text>
                      <Text size="sm" variant="muted">Transparent background</Text>
                    </Surface>
                  </Grid>
                </Stack>

                {/* Icon Buttons */}
                <Surface padding="lg" variant="outlined" radius="lg">
                  <Stack gap="md">
                    <Text size="lg" weight="semibold">Icon Button Variants</Text>
                    <Stack direction="row" gap="md" wrap>
                      <IconButton icon={Palette} size="sm" variant="default" aria-label="Default button" />
                      <IconButton icon={Type} size="md" variant="secondary" aria-label="Secondary button" />
                      <IconButton icon={Layout} size="lg" variant="outline" aria-label="Outline button" />
                      <IconButton icon={Sparkles} size="xl" variant="ghost" aria-label="Ghost button" />
                    </Stack>
                  </Stack>
                </Surface>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Stack>
    </Container>
  );
};
