'use client';

import { Box, Container, Grid, Stack, Text, Anchor, Group, Accordion, useMantineTheme, useMantineColorScheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconBrandFacebook, IconBrandTwitter, IconBrandInstagram, IconBrandLinkedin } from '@tabler/icons-react';
import Link from 'next/link';

interface FooterSection {
  title: string;
  links: {
    label: string;
    href: string;
  }[];
}

const FOOTER_SECTIONS: FooterSection[] = [
  {
    title: 'Support',
    links: [
      { label: 'Help Center', href: '/help' },
      { label: 'Safety Information', href: '/safety' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Accessibility', href: '/accessibility' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'Forums', href: '/forums' },
      { label: 'Activities', href: '/activities' },
      { label: 'News & Updates', href: '/news' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    title: 'About',
    links: [
      { label: 'Our Team', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
      { label: 'Partners', href: '/partners' },
    ],
  },
];

const SOCIAL_LINKS = [
  { icon: IconBrandFacebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: IconBrandTwitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: IconBrandInstagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: IconBrandLinkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
];

export default function Footer() {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <Box
      component="footer"
      bg={colorScheme === 'dark' ? 'dark.8' : 'gray.0'}
      mt="auto"
      style={{
        borderTop: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
      }}
    >
      <Container size="xl" py={isMobile ? 'xl' : 48}>
        {isMobile ? (
          // Mobile: Accordion layout
          <Stack gap="lg">
            <Accordion
              variant="separated"
              radius="md"
              styles={{
                item: {
                  backgroundColor: colorScheme === 'dark' ? theme.colors.dark[6] : theme.white,
                  borderColor: colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3],
                },
              }}
            >
              {FOOTER_SECTIONS.map((section) => (
                <Accordion.Item key={section.title} value={section.title}>
                  <Accordion.Control>
                    <Text fw={600} size="sm" c={colorScheme === 'dark' ? 'dark.0' : 'gray.7'}>
                      {section.title}
                    </Text>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Stack gap="xs">
                      {section.links.map((link) => (
                        <Anchor
                          key={link.href}
                          component={Link}
                          href={link.href}
                          size="sm"
                          c={colorScheme === 'dark' ? 'dark.2' : 'gray.6'}
                          underline="never"
                        >
                          {link.label}
                        </Anchor>
                      ))}
                    </Stack>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>

            {/* Social Links - Mobile */}
            <Group justify="center" gap="lg" mt="md">
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon;
                return (
                  <Anchor
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    c={colorScheme === 'dark' ? 'dark.2' : 'gray.6'}
                  >
                    <Icon size={24} stroke={1.5} />
                  </Anchor>
                );
              })}
            </Group>
          </Stack>
        ) : (
          // Desktop: Grid layout
          <Grid gutter="xl">
            {FOOTER_SECTIONS.map((section) => (
              <Grid.Col key={section.title} span={4}>
                <Stack gap="md">
                  <Text fw={600} size="sm" c={colorScheme === 'dark' ? 'dark.0' : 'gray.7'} tt="uppercase">
                    {section.title}
                  </Text>
                  <Stack gap="xs">
                    {section.links.map((link) => (
                      <Anchor
                        key={link.href}
                        component={Link}
                        href={link.href}
                        size="sm"
                        c={colorScheme === 'dark' ? 'dark.2' : 'gray.6'}
                        underline="never"
                      >
                        {link.label}
                      </Anchor>
                    ))}
                  </Stack>
                </Stack>
              </Grid.Col>
            ))}
          </Grid>
        )}

        {/* Bottom Section - Copyright & Links */}
        <Box
          mt={isMobile ? 'xl' : 48}
          pt={isMobile ? 'md' : 'xl'}
          style={{
            borderTop: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]}`,
          }}
        >
          <Group justify="space-between" align="center" wrap={isMobile ? 'wrap' : 'nowrap'} gap="md">
            {/* Copyright */}
            <Text size="sm" c="dimmed">
              © {new Date().getFullYear()} Ejam Kopā! All rights reserved.
            </Text>

            {/* Legal Links */}
            <Group gap="lg" wrap="nowrap">
              <Anchor
                component={Link}
                href="/privacy"
                size="sm"
                c="dimmed"
                underline="never"
              >
                Privacy
              </Anchor>
              <Anchor
                component={Link}
                href="/terms"
                size="sm"
                c="dimmed"
                underline="never"
              >
                Terms
              </Anchor>
              <Anchor
                component={Link}
                href="/cookies"
                size="sm"
                c="dimmed"
                underline="never"
              >
                Cookies
              </Anchor>
            </Group>

            {/* Social Links - Desktop */}
            {!isMobile && (
              <Group gap="md">
                {SOCIAL_LINKS.map((social) => {
                  const Icon = social.icon;
                  return (
                    <Anchor
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      c={colorScheme === 'dark' ? 'dark.2' : 'gray.6'}
                    >
                      <Icon size={20} stroke={1.5} />
                    </Anchor>
                  );
                })}
              </Group>
            )}
          </Group>
        </Box>
      </Container>
    </Box>
  );
}
