'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Title,
  Text,
  Button,
  Card,
  Stack,
  TextInput,
  PasswordInput,
  Center,
  Anchor,
  Box,
  useMantineTheme,
  useMantineColorScheme
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useMediaQuery } from '@mantine/hooks';

export default function SignupPage() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      name: (value) => (!value ? 'Name is required' : null),
      email: (value) => {
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        return null;
      },
      password: (value) => {
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return null;
      },
      confirmPassword: (value, values) => {
        if (!value) return 'Please confirm your password';
        if (value !== values.password) return 'Passwords do not match';
        return null;
      },
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        notifications.show({
          title: 'Account Created!',
          message: 'Registration successful. Please sign in.',
          color: 'green',
        });
        router.push('/auth/signin?message=Registration successful! Please sign in.');
      } else {
        notifications.show({
          title: 'Registration Failed',
          message: result.error || 'Failed to create account',
          color: 'red',
        });
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
              Join Our Community
            </Title>
            <Text size="md" c="dimmed" fw={500}>
              Create your account to connect with local activities
            </Text>
          </Box>

          {/* Form Section */}
          <Box p="xl">
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="md">
                <TextInput
                  label="Full Name"
                  placeholder="Your full name"
                  required
                  size="md"
                  {...form.getInputProps('name')}
                />

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
                  placeholder="Choose a secure password"
                  required
                  size="md"
                  {...form.getInputProps('password')}
                />

                <PasswordInput
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  required
                  size="md"
                  {...form.getInputProps('confirmPassword')}
                />

                <Button
                  type="submit"
                  size={isMobile ? 'lg' : 'md'}
                  loading={loading}
                  variant="gradient"
                  gradient={{ from: 'categoryGreen', to: 'categoryTeal', deg: 135 }}
                  fullWidth
                  mt="xs"
                  h={isMobile ? 48 : undefined}
                >
                  Create Account
                </Button>

                <Center>
                  <Text size="sm" c="dimmed">
                    Already have an account?{' '}
                    <Anchor component={Link} href="/auth/signin" c="categoryBlue" fw={600}>
                      Sign in
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