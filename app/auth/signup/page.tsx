'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  Anchor
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
      const response = await fetch('/api/register', {
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
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Container size="xs" py="xl">
        <Card shadow="lg" radius="lg" p="xl">
          <Center mb="xl">
            <Stack align="center" gap="sm">
              <Title order={1}>Join Our Community</Title>
              <Text c="dimmed" ta="center">
                Create your account to connect with local activities
              </Text>
            </Stack>
          </Center>
          
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Full Name"
                placeholder="Your full name"
                size="md"
                {...form.getInputProps('name')}
                required
              />
              
              <TextInput
                label="Email Address"
                placeholder="your@email.com"
                size="md"
                {...form.getInputProps('email')}
                required
              />
              
              <PasswordInput
                label="Password"
                placeholder="Choose a secure password"
                size="md"
                {...form.getInputProps('password')}
                required
              />
              
              <PasswordInput
                label="Confirm Password"
                placeholder="Confirm your password"
                size="md"
                {...form.getInputProps('confirmPassword')}
                required
              />
              
              <Button
                type="submit"
                size="lg"
                fullWidth
                loading={loading}
                mt="md"
              >
                Create Account
              </Button>
              
              <Center>
                <Text size="sm" c="dimmed">
                  Already have an account?{' '}
                  <Anchor component={Link} href="/auth/signin" fw={500}>
                    Sign in
                  </Anchor>
                </Text>
              </Center>
            </Stack>
          </form>
        </Card>
      </Container>
    </div>
  );
}