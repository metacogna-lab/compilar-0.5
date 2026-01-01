# PILAR Application Style Guide

## Table of Contents
1. [Code Style](#code-style)
2. [File Organization](#file-organization)
3. [Component Structure](#component-structure)
4. [Naming Conventions](#naming-conventions)
5. [State Management](#state-management)
6. [API Integration](#api-integration)
7. [Styling Guidelines](#styling-guidelines)
8. [Performance Best Practices](#performance-best-practices)

---

## Code Style

### General Principles
- **Clarity over cleverness**: Write code that's easy to understand
- **DRY (Don't Repeat Yourself)**: Extract reusable logic
- **Small components**: Keep components focused and under 300 lines
- **Consistent formatting**: Use Prettier/ESLint settings

### JavaScript/React Standards

#### Imports
Group and order imports:
```jsx
// 1. React imports
import React, { useState, useEffect, useRef } from 'react';

// 2. Third-party libraries
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';

// 3. UI components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 4. Icons
import { Compass, Heart, BookOpen } from 'lucide-react';

// 5. Local components
import PillarCard from '../components/pilar/PillarCard';

// 6. Utilities & constants
import { base44 } from '@/api/base44Client';
import { pillarColors, pillarIcons } from './constants';
```

#### Variable Declarations
```jsx
// Use const by default
const userName = 'John Doe';

// Use let only when reassignment is needed
let counter = 0;

// Destructure objects and arrays
const { name, email } = user;
const [first, second, ...rest] = items;
```

#### Arrow Functions
```jsx
// Preferred: Arrow functions for components and callbacks
const MyComponent = ({ prop1, prop2 }) => {
  return <div>{prop1}</div>;
};

// Implicit return for simple JSX
const ListItem = ({ text }) => (
  <li className="text-white">{text}</li>
);

// Named exports for components
export default MyComponent;
```

---

## File Organization

### Directory Structure
```
/pages              # Page components (flat structure)
  Home.js
  Profile.js
  PilarInfo.js

/components
  /pilar            # Domain-specific components
    PillarCard.jsx
    Pilar3DGraph.jsx
  /ui               # Reusable UI components (shadcn)
    button.jsx
    card.jsx
  /admin            # Admin-specific components
    AdminNav.jsx

/entities           # Database schemas (JSON)
  User.json
  PilarAssessment.json

/functions          # Backend functions (Deno)
  someFunction.js

/agents             # AI agent configs (JSON)
  pilar_theory_guide.json

Layout.js           # App-wide layout wrapper
globals.css         # Global styles (minimal)
```

### File Naming

#### Components
- **PascalCase**: `PillarCard.jsx`, `UserProfile.jsx`
- **Descriptive names**: Clearly indicate component purpose
- **Domain prefixes**: `Pilar*`, `Team*`, `Admin*`

#### Pages
- **PascalCase**: `Home.js`, `Profile.js`
- **No nesting**: All pages in flat `/pages` directory

#### Utilities
- **camelCase**: `formatDate.js`, `calculateScore.js`
- **Descriptive**: Function name = file name

---

## Component Structure

### Standard Component Template
```jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Compass } from 'lucide-react';

// 1. Constants (if any)
const ANIMATION_DURATION = 0.3;

// 2. Helper functions (if needed)
const formatPillarName = (name) => {
  return name.charAt(0).toUpperCase() + name.slice(1);
};

// 3. Main component
export default function PillarCard({ pillar, onSelect, isSelected }) {
  // 4. Hooks (in order)
  const [isHovered, setIsHovered] = useState(false);
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // Side effects
  }, [pillar]);
  
  // 5. Event handlers
  const handleClick = () => {
    onSelect(pillar.id);
  };
  
  const handleHover = () => {
    setIsHovered(true);
  };
  
  // 6. Derived values
  const pillarColor = pillarColors[pillar.id];
  const iconComponent = pillarIcons[pillar.id];
  
  // 7. Render
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="rounded-2xl p-6 bg-white/5"
    >
      {/* Component JSX */}
    </motion.div>
  );
}

// 8. PropTypes or TypeScript types (optional)
PillarCard.propTypes = {
  // ...
};
```

### Component Size Guidelines
- **Tiny**: < 50 lines - Single-purpose UI elements
- **Small**: 50-150 lines - Standard components
- **Medium**: 150-300 lines - Feature components
- **Large**: 300+ lines - Consider breaking down into smaller components

### When to Split Components
Split a component when:
- It exceeds 300 lines
- It has multiple distinct responsibilities
- You find yourself scrolling to understand it
- Parts could be reused elsewhere

---

## Naming Conventions

### Variables
```jsx
// Booleans: is/has/should prefix
const isLoading = true;
const hasError = false;
const shouldRender = true;

// Arrays: plural nouns
const users = [];
const pillars = [];
const connections = [];

// Objects: singular nouns
const user = {};
const pillar = {};
const config = {};

// Functions: verb + noun
const fetchUsers = () => {};
const calculateScore = () => {};
const handleClick = () => {};
```

### React Hooks
```jsx
// State: descriptive name
const [selectedPillar, setSelectedPillar] = useState(null);
const [isModalOpen, setIsModalOpen] = useState(false);

// Refs: descriptive name + Ref suffix
const canvasRef = useRef(null);
const inputRef = useRef(null);

// Custom hooks: use prefix
const useAuth = () => {};
const usePillarData = () => {};
```

### Event Handlers
```jsx
// Format: handle + Action + (Element)
const handleClick = () => {};
const handleSubmit = () => {};
const handlePillarSelect = () => {};
const handleModalClose = () => {};

// Callback props: on + Action
<Component 
  onClick={handleClick}
  onSubmit={handleSubmit}
  onPillarSelect={handlePillarSelect}
/>
```

### CSS Classes
```jsx
// Use Tailwind utility classes
className="flex items-center gap-4"

// Conditional classes with template literals
className={`rounded-lg p-4 ${isActive ? 'bg-violet-500' : 'bg-zinc-800'}`}

// Or use cn() utility for complex conditions
import { cn } from '@/lib/utils';
className={cn(
  "rounded-lg p-4",
  isActive && "bg-violet-500",
  !isActive && "bg-zinc-800"
)}
```

---

## State Management

### Local State (useState)
Use for component-specific state:
```jsx
const [isOpen, setIsOpen] = useState(false);
const [selectedItem, setSelectedItem] = useState(null);
const [inputValue, setInputValue] = useState('');
```

### Server State (React Query)
Use for API data:
```jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// Fetching data
const { data: assessments, isLoading, error } = useQuery({
  queryKey: ['assessments', userId],
  queryFn: () => base44.entities.PilarAssessment.filter({ 
    created_by: userId 
  }),
  initialData: []
});

// Mutations
const queryClient = useQueryClient();

const createAssessmentMutation = useMutation({
  mutationFn: (data) => base44.entities.PilarAssessment.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['assessments'] });
  }
});

// Using mutation
const handleCreate = async (assessmentData) => {
  await createAssessmentMutation.mutateAsync(assessmentData);
};
```

### Global State
For truly global state, use React Context:
```jsx
// Avoid over-using Context - most state should be local or server state
const UserContext = React.createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Usage
const { user, setUser } = useContext(UserContext);
```

---

## API Integration

### Base44 SDK Usage

#### Authentication
```jsx
import { base44 } from '@/api/base44Client';

// Get current user
const user = await base44.auth.me();

// Update current user
await base44.auth.updateMe({ 
  display_name: 'John Doe' 
});

// Logout
base44.auth.logout();
```

#### Entity Operations
```jsx
// List all
const items = await base44.entities.EntityName.list();

// List with sorting and limit
const recent = await base44.entities.EntityName.list('-created_date', 20);

// Filter
const filtered = await base44.entities.EntityName.filter({
  status: 'active',
  created_by: user.email
}, '-updated_date', 10);

// Create
const newItem = await base44.entities.EntityName.create({
  title: 'My Item',
  description: 'Description'
});

// Bulk create
await base44.entities.EntityName.bulkCreate([
  { title: 'Item 1' },
  { title: 'Item 2' }
]);

// Update
await base44.entities.EntityName.update(itemId, {
  title: 'Updated Title'
});

// Delete
await base44.entities.EntityName.delete(itemId);

// Get schema
const schema = await base44.entities.EntityName.schema();
```

#### Integrations
```jsx
// LLM invocation
const response = await base44.integrations.Core.InvokeLLM({
  prompt: 'Your prompt here',
  add_context_from_internet: false,
  response_json_schema: { /* optional */ }
});

// File upload
const { file_url } = await base44.integrations.Core.UploadFile({
  file: fileObject
});
```

#### Backend Functions
```jsx
// Call backend function
const response = await base44.functions.invoke('functionName', {
  param1: 'value1',
  param2: 'value2'
});

// Response structure: { data, status, headers }
const result = response.data;
```

---

## Styling Guidelines

### Tailwind CSS Best Practices

#### Responsive Design
```jsx
// Mobile-first approach
className="text-sm md:text-base lg:text-lg"

// Responsive layouts
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"

// Responsive spacing
className="p-4 md:p-6 lg:p-8"
```

#### Component Composition
```jsx
// Extract repeated patterns into components
// BAD: Repeating classes
<div className="rounded-2xl p-6 bg-white/5 border border-white/10">
<div className="rounded-2xl p-6 bg-white/5 border border-white/10">

// GOOD: Reusable component
const Card = ({ children }) => (
  <div className="rounded-2xl p-6 bg-white/5 border border-white/10">
    {children}
  </div>
);
```

#### Dynamic Styles
```jsx
// Use inline styles for dynamic colors
<div style={{ color: pillarColors[pillarId] }}>

// Use template literals for conditional classes
className={`base-class ${condition ? 'active-class' : 'inactive-class'}`}

// Use cn() for complex conditions
import { cn } from '@/lib/utils';
className={cn(
  "base-class",
  isActive && "active-class",
  isDisabled && "disabled-class"
)}
```

### Animation Guidelines
```jsx
// Simple transitions
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>

// Reusable animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

<motion.div
  variants={cardVariants}
  initial="hidden"
  animate="visible"
>

// Stagger children
<motion.div variants={containerVariants}>
  {items.map(item => (
    <motion.div key={item.id} variants={itemVariants}>
      {item.name}
    </motion.div>
  ))}
</motion.div>
```

---

## Performance Best Practices

### Memoization
```jsx
// useMemo for expensive calculations
const sortedItems = useMemo(() => {
  return items.sort((a, b) => a.score - b.score);
}, [items]);

// useCallback for event handlers passed to children
const handleClick = useCallback((id) => {
  setSelectedId(id);
}, []);

// React.memo for components that rarely change
const PillarIcon = React.memo(({ pillar }) => {
  return <Icon pillarId={pillar.id} />;
});
```

### Lazy Loading
```jsx
// Lazy load heavy components
const Pillar3DGraph = React.lazy(() => import('./Pillar3DGraph'));

// Usage with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Pillar3DGraph />
</Suspense>
```

### Query Optimization
```jsx
// Use initialData to prevent loading states
const { data } = useQuery({
  queryKey: ['items'],
  queryFn: fetchItems,
  initialData: []  // Prevents undefined errors
});

// Use staleTime for data that doesn't change often
const { data } = useQuery({
  queryKey: ['config'],
  queryFn: fetchConfig,
  staleTime: 5 * 60 * 1000  // 5 minutes
});
```

### Image Optimization
```jsx
// Use proper image sizing
<img 
  src={imageUrl} 
  alt="Description"
  loading="lazy"
  width={400}
  height={300}
/>

// Use Unsplash with size parameters
const imageUrl = `https://images.unsplash.com/photo-xyz?w=800&q=80`;
```

---

## Error Handling

### Try-Catch for Async Operations
```jsx
const handleSubmit = async () => {
  try {
    setIsLoading(true);
    await base44.entities.Item.create(data);
    toast.success('Item created successfully');
  } catch (error) {
    console.error('Failed to create item:', error);
    toast.error('Failed to create item');
  } finally {
    setIsLoading(false);
  }
};
```

### Error Boundaries
```jsx
// For catching React errors
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

---

## Testing Guidelines

### Component Testing Checklist
- [ ] Renders without crashing
- [ ] Handles props correctly
- [ ] Interactive elements work (click, hover)
- [ ] Conditional rendering works
- [ ] Loading states display correctly
- [ ] Error states display correctly
- [ ] Responsive on different screen sizes

### Manual Testing
1. Test on Chrome, Firefox, Safari
2. Test on mobile devices
3. Test keyboard navigation
4. Test with slow network
5. Test error scenarios

---

## Code Review Checklist

Before submitting code for review:

- [ ] Code follows this style guide
- [ ] No console.log statements (except intentional)
- [ ] Removed commented-out code
- [ ] Component is broken down (< 300 lines)
- [ ] Used appropriate hooks (useState, useQuery, etc.)
- [ ] Animations are smooth and purposeful
- [ ] Accessible (keyboard navigation, ARIA labels)
- [ ] Responsive design tested
- [ ] Error handling implemented
- [ ] Loading states implemented

---

## Common Patterns

### Modal Pattern
```jsx
const [isOpen, setIsOpen] = useState(false);

<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60"
      onClick={() => setIsOpen(false)}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-zinc-900 rounded-3xl p-6"
      >
        {/* Modal content */}
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

### List Rendering Pattern
```jsx
{items.length > 0 ? (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {items.map((item) => (
      <ItemCard key={item.id} item={item} />
    ))}
  </div>
) : (
  <EmptyState message="No items found" />
)}
```

### Loading Pattern
```jsx
if (isLoading) {
  return <LoadingSpinner />;
}

if (error) {
  return <ErrorState error={error} />;
}

return <Content data={data} />;
```

---

## Resources

- [React Documentation](https://react.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [React Query Docs](https://tanstack.com/query/latest)
- [Base44 SDK Docs](https://docs.base44.com)

---

**Last Updated**: December 2025  
**Version**: 1.0  
**Maintained by**: PILAR Development Team