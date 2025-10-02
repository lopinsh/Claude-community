# Typography Guide - Use Mantine Props Only

## ❌ NEVER USE
```tsx
// BAD - Inline font sizing
style={{ fontSize: '14px' }}
style={{ fontSize: '18px', fontWeight: 600 }}
<h3 style={{ fontSize: '18px' }}>Title</h3>
```

## ✅ ALWAYS USE Mantine Props

### Text Component Sizes
```tsx
<Text size="xs">   {/* 12px */}
<Text size="sm">   {/* 14px */}
<Text size="md">   {/* 16px - default */}
<Text size="lg">   {/* 18px */}
<Text size="xl">   {/* 20px */}
```

### Font Weights
```tsx
<Text fw={400}>    {/* normal */}
<Text fw={500}>    {/* medium */}
<Text fw={600}>    {/* semibold */}
<Text fw={700}>    {/* bold */}
<Text fw={800}>    {/* extrabold */}
```

### Title Component (for headings)
```tsx
<Title order={1}>  {/* h1 - 32px */}
<Title order={2}>  {/* h2 - 24px */}
<Title order={3}>  {/* h3 - 20px */}
<Title order={4}>  {/* h4 - 18px */}
<Title order={5}>  {/* h5 - 16px */}
<Title order={6}>  {/* h6 - 14px */}
```

### Examples

**Card Title:**
```tsx
// BAD
<h3 style={{ fontSize: '18px', fontWeight: 700 }}>Title</h3>

// GOOD
<Text fw={700} size="lg">Title</Text>
// OR
<Title order={4}>Title</Title>
```

**Description Text:**
```tsx
// BAD
<p style={{ fontSize: '14px', color: '#64748b' }}>Description</p>

// GOOD
<Text size="sm" c="dimmed">Description</Text>
```

**Small Labels:**
```tsx
// BAD
<span style={{ fontSize: '13px', fontWeight: 500 }}>Label</span>

// GOOD
<Text size="sm" fw={500}>Label</Text>
```

**Badge/Pill Text:**
```tsx
// BAD
<Badge style={{ fontSize: '11px' }}>New</Badge>

// GOOD
<Badge size="xs">New</Badge>
<Badge size="sm">New</Badge>
```

## Component-Specific Sizes

### Button
```tsx
<Button size="xs">   {/* Compact */}
<Button size="sm">   {/* Small */}
<Button size="md">   {/* Medium - default */}
<Button size="lg">   {/* Large */}
<Button size="xl">   {/* Extra large */}
```

### Badge
```tsx
<Badge size="xs">    {/* 10px font */}
<Badge size="sm">    {/* 11px font */}
<Badge size="md">    {/* 13px font - default */}
<Badge size="lg">    {/* 14px font */}
<Badge size="xl">    {/* 16px font */}
```

## Color Props (Use theme colors)
```tsx
<Text c="dimmed">          {/* theme.colors.gray[6] */}
<Text c="gray">            {/* theme.colors.gray[7] */}
<Text c="indigo">          {/* theme.colors.indigo[5] */}
<Text c="red">             {/* theme.colors.red[5] */}
<Text c="white">           {/* #ffffff */}
```

## Line Height
```tsx
<Text lh={1}>      {/* Tight */}
<Text lh={1.3}>    {/* Heading */}
<Text lh={1.5}>    {/* Body - default */}
<Text lh={1.6}>    {/* Relaxed */}
```

## Text Transformation
```tsx
<Text tt="uppercase">  {/* UPPERCASE */}
<Text tt="lowercase">  {/* lowercase */}
<Text tt="capitalize"> {/* Capitalize */}
```

## Text Truncation
```tsx
<Text lineClamp={1}>   {/* Truncate to 1 line */}
<Text lineClamp={2}>   {/* Truncate to 2 lines */}
<Text truncate>        {/* Truncate with ellipsis */}
```

## Summary
- Use `<Text>` for body text with `size` prop
- Use `<Title>` for headings with `order` prop
- Use `fw` for font-weight
- Use `c` for color
- Use `lh` for line-height
- NEVER use inline `fontSize` or `font-size` styles