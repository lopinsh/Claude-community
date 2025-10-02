'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import {
  Container,
  Title,
  Text,
  Button,
  Card,
  Stack,
  TextInput,
  PasswordInput,
  Center,
  Alert,
  Anchor,
  Box,
  useMantineTheme,
  useMantineColorScheme
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useMediaQuery } from '@mantine/hooks';

export default function SigninPage() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();

  // Get success message from URL params
  const message = searchParams.get('message');

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (!value ? 'Email is required' : null),
      password: (value) => (!value ? 'Password is required' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        notifications.show({
          title: 'Sign In Failed',
          message: 'Invalid email or password',
          color: 'red',
        });
      } else {
        // Refresh session and redirect to home
        await getSession();
        notifications.show({
          title: 'Welcome back!',
          message: 'Successfully signed in',
          color: 'green',
        });
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'An error occurred. Please try again.',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      mih="100vh"
      bg={colorScheme === 'dark' ? 'dark.7' : 'gray.0'}
    >
      <Center mih="100vh" p={isMobile ? 0 : 'md'}>
        <Card
          radius={isMobile ? 0 : 'xl'}
          withBorder={!isMobile}
          shadow={isMobile ? 'none' : 'xl'}
          w="100%"
          maw={isMobile ? '100%' : 420}
          p={0}
          mih={isMobile ? '100vh' : undefined}
        >
          {/* Header Section */}
          <Box
            p="xl"
            pb="lg"
            bg={colorScheme === 'dark' ? 'dark.6' : 'gray.0'}
            style={{
              borderBottom: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]}`,
            }}
            ta="center"
          >
            <Title
              order={2}
              fw={800}
              style={{
                background: theme.other.brandGradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
              mb="xs"
            >
              Welcome Back
            </Title>
            <Text size="md" c="dimmed" fw={500}>
              Sign in to your community account
            </Text>
          </Box>

          {/* Form Section */}
          <Box p="xl">
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="lg">
                {message && (
                  <Alert color="categoryGreen" title="Success!" radius="md">
                    {message}
                  </Alert>
                )}

                <TextInput
                  label="Email Address"
                  placeholder="your@email.com"
                  type="email"
                  required
                  size="md"
                  {...form.getInputProps('email')}
                />

                <PasswordInput
                  label="Password"
                  placeholder="Your password"
                  required
                  size="md"
                  {...form.getInputProps('password')}
                />

                <Button
                  type="submit"
                  size={isMobile ? 'lg' : 'md'}
                  loading={loading}
                  variant="gradient"
                  gradient={{ from: 'categoryBlue', to: 'categoryPeach', deg: 135 }}
                  fullWidth
                  mt="xs"
                  h={isMobile ? 48 : undefined}
                >
                  Sign In
                </Button>

                <Center>
                  <Text size="sm" c="dimmed">
                    Don't have an account?{' '}
                    <Anchor component={Link} href="/auth/signup" c="categoryBlue" fw={600}>
                      Sign up
                    </Anchor>
                  </Text>
                </Center>
              </Stack>
            </form>
          </Box>
        </Card>
      </Center>
    </Box>
  );
}