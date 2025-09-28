'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Alert,
  Anchor
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';

export default function SigninPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
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
              <Title order={1}>Welcome Back</Title>
              <Text c="dimmed" ta="center">
                Sign in to your community account
              </Text>
            </Stack>
          </Center>
          
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              {message && (
                <Alert color="green" title="Success!">
                  {message}
                </Alert>
              )}
              
              <TextInput
                label="Email Address"
                placeholder="your@email.com"
                size="md"
                {...form.getInputProps('email')}
                required
              />
              
              <PasswordInput
                label="Password"
                placeholder="Your password"
                size="md"
                {...form.getInputProps('password')}
                required
              />
              
              <Button
                type="submit"
                size="lg"
                fullWidth
                loading={loading}
                mt="md"
              >
                Sign In
              </Button>
              
              <Center>
                <Text size="sm" c="dimmed">
                  Don't have an account?{' '}
                  <Anchor component={Link} href="/auth/signup" fw={500}>
                    Sign up
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