# UI Component Inventory - Main Web Application

*Generated as part of comprehensive project documentation*

## Design System Overview

Wale Plan uses a **modern, component-based design system** built with **shadcn/ui** components, **Tailwind CSS**, and **Radix UI** primitives. The system prioritizes accessibility, type safety, and developer experience while maintaining visual consistency across the application.

### Core Design Philosophy

- **Accessibility First**: Built on Radix UI primitives with full ARIA support
- **Type Safety**: End-to-end TypeScript component props
- **Utility-First**: Tailwind CSS for rapid development and consistency
- **Component Composition**: Small, reusable components that compose together
- **Dark Mode Ready**: Complete dark/light theme support

## Technology Stack

### Primary Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| **shadcn/ui** | Latest | Component library built on Radix UI |
| **Radix UI** | ^1.3.3 | Unstyled, accessible component primitives |
| **Tailwind CSS** | ^3.4.0 | Utility-first CSS framework |
| **Lucide React** | ^0.555.0 | Consistent icon library |
| **Class Variance Authority** | ^0.7.1 | Component variant management |
| **clsx** | ^2.1.1 | Conditional className utility |

### Key Dependencies

```json
{
  "@radix-ui/react-checkbox": "^1.3.3",
  "@radix-ui/react-label": "^2.1.8",
  "@radix-ui/react-separator": "^1.1.8",
  "@radix-ui/react-slot": "^1.2.4",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.4.0",
  "lucide-react": "^0.555.0",
  "tailwindcss-animate": "^1.0.7"
}
```

## Component Categories

### 1. Form Components

#### Button (`/src/components/ui/button.tsx`)

**Purpose**: Primary action component with multiple variants

**Variants:**
- **Default**: Standard primary button style
- **Destructive**: Danger action (delete, remove)
- **Outline**: Secondary action with border
- **Secondary**: Subtle secondary action
- **Ghost**: Minimal style, hover effect only
- **Link**: Link-like appearance

**Sizes:**
- **Default**: Standard button height (h-9)
- **sm**: Small button (h-8)
- **lg**: Large button (h-10)
- **icon**: Square button for icons

**Features:**
- Full keyboard navigation
- Loading states with spinner
- Disabled states
- Focus management
- As prop support (button, link, etc.)

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}
```

#### Input (`/src/components/ui/input.tsx`)

**Purpose**: Text input field with consistent styling

**Features:**
- Focus states with outline
- Error state support
- Disabled state styling
- File input support
- Placeholder text
- Full accessibility support

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // Extends standard HTML input props
}
```

#### Label (`/src/components/ui/label.tsx`)

**Purpose**: Form label with accessibility features

**Features:**
- Proper HTML label element
- Click-to-focus input association
- Screen reader support
- Disabled state styling

#### Checkbox (`/src/components/ui/checkbox.tsx`)

**Purpose**: Custom checkbox component built on Radix UI

**Features:**
- Custom styling with CSS variables
- Indeterminate state support
- Keyboard navigation
- Screen reader announcements
- Focus management

```typescript
interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  // Extends Radix UI checkbox props
}
```

#### Form (`/src/components/ui/form.tsx`)

**Purpose**: Complete form system with React Hook Form integration

**Components:**
- **FormField**: Individual form field wrapper
- **FormItem**: Field container with proper spacing
- **FormLabel**: Connected label component
- **FormControl**: Input container with validation state
- **FormDescription**: Helper text below inputs
- **FormMessage**: Error and validation messages

**Features:**
- React Hook Form integration
- Zod schema validation
- Error state management
- Accessibility support
- Automatic field registration

### 2. Layout Components

#### Card (`/src/components/ui/card.tsx`)

**Purpose**: Content container with consistent styling

**Subcomponents:**
- **CardHeader**: Header section with title and optional actions
- **CardTitle**: Title typography
- **CardDescription**: Descriptive text
- **CardContent**: Main content area
- **CardFooter**: Footer section with actions

**Features:**
- Flexible content structure
- Consistent padding and spacing
- Shadow and border styling
- Responsive design
- Dark mode support

```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  // Standard div props with card styling
}
```

#### Separator (`/src/components/ui/separator.tsx`)

**Purpose**: Visual divider between content sections

**Features:**
- Horizontal and vertical orientation
- Customizable styling
- Accessibility support (presentation role)
- Consistent spacing

## Design System Elements

### Color System

**Technology**: OKLCH color space with CSS custom properties

#### Primary Colors
```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.205 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.205 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.205 0 0);
}
```

#### Semantic Colors
```css
:root {
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.98 0 0);
  --secondary: oklch(0.96 0.008 255.555);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.96 0.008 255.555);
  --muted-foreground: oklch(0.46 0 0);
  --accent: oklch(0.96 0.008 255.555);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.98 0 0);
}
```

#### Data Visualization Colors
```css
:root {
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.834 0.077 271.549);
  --chart-5: oklch(0.558 0.09 332.064);
}
```

### Typography

**Primary Font**: Geist Sans (Google Font)

**Font Scale:**
```css
@theme {
  --font-sans: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;
}
```

**Font Sizes**: Tailwind CSS default scale with custom font weights

**Font Weights:**
- **Light**: 300
- **Normal**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

### Spacing and Sizing

**Border Radius**: Consistent radius system
```css
:root {
  --radius: 0.625rem;
}
```

**Spacing**: Tailwind's default spacing scale (4px base unit)

**Component Heights**:
- **Small**: h-8 (32px)
- **Default**: h-9 (36px)
- **Large**: h-10 (40px)
- **Icon**: h-10 w-10 (40px square)

## Styling Architecture

### CSS Organization

**Global Styles**: `/src/styles/globals.css`

```css
@import "tailwindcss";
@import "tw-animate-css";

@theme {
  --font-sans: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;
}

@custom-variant dark (&:is(.dark *));
```

### Utility Functions

**Class Name Merging**: `/src/lib/utils.ts`

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Usage**:
```typescript
const className = cn(
  "base-styles",
  conditional && "conditional-styles",
  props.className
);
```

### Component Variant System

**Class Variance Authority (CVA)**: Used for managing component variants

```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

## Icon System

**Library**: Lucide React

**Features:**
- Consistent 4x4 default size
- Scalable through Tailwind classes
- 1000+ icons available
- Tree-shakeable imports
- Multiple stroke widths

**Usage Examples**:
```typescript
import { Check, ChevronRight, Plus, Trash2 } from "lucide-react";

// Standard usage
<Check className="h-4 w-4" />

// Custom sizing
<ChevronRight className="h-6 w-6" />

// With color
<Plus className="h-4 w-4 text-primary" />
```

## Form Architecture

### Form Validation Stack

**Technologies**:
- **React Hook Form**: Form state management
- **Zod**: Schema validation
- **@hookform/resolvers**: Zod integration

**Example Form**:
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: { name: "", email: "" },
});
```

### Form Features

**Validation**:
- Client-side validation with Zod schemas
- Server-side validation integration
- Real-time validation feedback
- Custom validation messages

**Accessibility**:
- Proper ARIA attributes
- Screen reader support
- Keyboard navigation
- Focus management
- Error announcement

**States**:
- Loading states during submission
- Disabled states for invalid forms
- Success state feedback
- Error state handling

## Layout Components and Navigation

### Page Structure

**App Router Structure**:
```
/app
├── layout.tsx           # Root layout with fonts and providers
├── page.tsx             # Home page
├── auth/                # Authentication pages
│   ├── layout.tsx       # Auth layout
│   └── page.tsx         # Auth form
├── dashboard/           # Main application
│   ├── page.tsx         # Dashboard overview
│   └── organizations/   # Organization management
│       ├── page.tsx     # Organizations list
│       └── new/         # New organization form
```

### Layout Patterns

**Card-Based Layouts**:
```typescript
<Card>
  <CardHeader>
    <CardTitle>Project Overview</CardTitle>
    <CardDescription>View and manage your projects</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Project content */}
  </CardContent>
  <CardFooter>
    <Button>Create New Project</Button>
  </CardFooter>
</Card>
```

**Responsive Grids**:
```typescript
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  {/* Responsive card grid */}
</div>
```

## Accessibility Features

### ARIA Support

**Form Components**:
- Proper labeling with `htmlFor` and `id` association
- `aria-describedby` for field descriptions
- `aria-invalid` for validation states
- `aria-required` for required fields

**Interactive Components**:
- `role="presentation"` for decorative elements
- `tabIndex` management
- Focus indicators
- Keyboard navigation support

### State Management

**Loading States**:
```typescript
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isLoading ? "Saving..." : "Save"}
</Button>
```

**Error States**:
```typescript
<FormField
  control={form.control}
  name="name"
  render={({ field, fieldState }) => (
    <FormItem>
      <FormLabel>Name</FormLabel>
      <FormControl>
        <Input {...field} className={fieldState.error ? "border-destructive" : ""} />
      </FormControl>
      {fieldState.error && (
        <FormMessage>{fieldState.error.message}</FormMessage>
      )}
    </FormItem>
  )}
/>
```

## Dark Mode Implementation

### Theme System

**CSS Custom Properties**: Complete theme support with CSS variables

**Theme Toggle**: Built-in theme switching capability

**Dark Mode Colors**:
```css
.dark {
  --background: oklch(0.09 0 0);
  --foreground: oklch(0.98 0 0);
  --card: oklch(0.09 0 0);
  --card-foreground: oklch(0.98 0 0);
  /* ... all other colors adjusted for dark theme */
}
```

**Usage**:
```typescript
// Components automatically adapt to theme
<Card className="dark:bg-gray-900">
  <CardTitle className="dark:text-white">
    Theme-aware content
  </CardTitle>
</Card>
```

## Component Organization

### File Structure

```
/src/
├── components/
│   └── ui/                    # Reusable UI components
│       ├── button.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── checkbox.tsx
│       ├── form.tsx
│       ├── card.tsx
│       └── separator.tsx
├── app/
│   ├── _components/          # Page-specific components
│   ├── auth/
│   ├── dashboard/
│   └── organizations/
├── lib/
│   ├── utils.ts              # Utility functions
│   └── auth.ts               # Auth utilities
└── styles/
    └── globals.css           # Global styles and theme
```

### Import Patterns

**TypeScript Path Mapping**: Clean imports with absolute paths

```typescript
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
```

**Component Exports**: Clean re-exports from component directories

```typescript
// src/components/ui/index.ts (optional)
export { Button } from './button';
export { Input } from './input';
export { Label } from './label';
// ... other exports
```

## Development Guidelines

### Component Design Principles

1. **Composability**: Small components that compose together
2. **Consistency**: Unified styling and behavior
3. **Accessibility**: Built-in ARIA support and keyboard navigation
4. **Type Safety**: Full TypeScript prop definitions
5. **Performance**: Optimized re-renders and minimal bundle size

### Best Practices

**Component Structure**:
```typescript
interface ComponentProps {
  // Define explicit prop types
}

export function Component({ ...props }: ComponentProps) {
  return (
    <div className={cn("base-styles", props.className)}>
      {/* Component content */}
    </div>
  );
}
```

**Variant Management**:
```typescript
// Use CVA for component variants
const variants = cva("base-styles", {
  variants: {
    variant: { /* variant definitions */ },
    size: { /* size definitions */ },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});
```

**Styling Consistency**:
```typescript
// Use utility classes for styling
<div className="flex flex-col space-y-2">
  <h3 className="text-lg font-semibold">Title</h3>
  <p className="text-sm text-muted-foreground">Description</p>
</div>
```

---

*This UI component inventory provides a comprehensive overview of the design system used in Wale Plan, demonstrating a modern, accessible, and maintainable approach to component development with excellent TypeScript support and developer experience.*