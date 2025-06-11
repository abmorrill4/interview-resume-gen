
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Cpu, Database, BarChart3 } from 'lucide-react';
import { Container, Stack, Text, Surface, Grid } from '@/components/ui/design-system';

const SystemStats: React.FC = () => {
  const systemStats = [
    { label: 'Interviews', value: '2.4K', icon: Cpu, trend: '+12%', color: 'text-electric-blue' },
    { label: 'Profiles', value: '89', icon: Database, trend: '+24%', color: 'text-neon-green' },
    { label: 'Success Rate', value: '94.2%', icon: BarChart3, trend: '+8%', color: 'text-sunset-orange' },
  ];

  return (
    <Grid responsive={{ sm: 1, md: 3 }} gap="lg">
      {systemStats.map((stat, index) => (
        <Card 
          key={stat.label} 
          className="card-glow border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm hover:shadow-xl transition-all duration-300"
          style={{ animationDelay: `${0.4 + index * 0.1}s` }}
        >
          <CardContent className="p-6">
            <Stack direction="row" justify="between" align="center">
              <Stack gap="sm">
                <Text size="sm" variant="muted" weight="medium">{stat.label}</Text>
                <Text size="2xl" weight="bold">{stat.value}</Text>
                <Stack direction="row" gap="sm" align="center">
                  <TrendingUp className="h-4 w-4 text-neon-green" />
                  <Text size="sm" weight="semibold" className="text-neon-green">{stat.trend}</Text>
                </Stack>
              </Stack>
              <Surface variant="ghost" padding="md" radius="xl" className="bg-gradient-primary floating">
                <stat.icon className="h-6 w-6 text-white" />
              </Surface>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Grid>
  );
};

export default SystemStats;
