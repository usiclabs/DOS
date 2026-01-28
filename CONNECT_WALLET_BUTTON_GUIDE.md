# Connect Wallet Button - Integration Guide

## Overview

The `ConnectWalletButton` component provides a unified, consistently-styled wallet connection interface across the entire platform. It handles multiple wallet providers, connection states, and provides a seamless user experience with proper loading states and error handling.

## Component Location

`/components/ui/connect-wallet-button.tsx`

## Features

- **Unified Design**: Single visual style across all pages
- **Multiple Wallet Support**: MetaMask, Coinbase Wallet, WalletConnect, Rainbow
- **State Management**: Handles connecting, connected, and disconnecting states
- **Loading States**: Animated loading feedback during connection
- **Responsive**: Adapts from mobile to desktop with appropriate sizing
- **Accessibility**: ARIA labels and proper semantic HTML
- **Animation**: Smooth Framer Motion transitions
- **Glow Effects**: Integrated with platform's subtle glow styling

## Props

```typescript
interface ConnectWalletButtonProps {
  // Required
  onConnect: (walletType: string) => Promise<void>
  
  // Optional
  onDisconnect?: () => void
  isConnected?: boolean
  address?: string | null
  balance?: string
  isConnecting?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
  variant?: "button" | "dropdown"
  network?: string
}
```

### Prop Details

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onConnect` | function | Required | Callback when connecting wallet |
| `onDisconnect` | function | - | Callback when disconnecting |
| `isConnected` | boolean | false | Connection state |
| `address` | string \| null | null | Wallet address |
| `balance` | string | "0" | ETH balance |
| `isConnecting` | boolean | false | Loading state |
| `size` | "sm" \| "md" \| "lg" | "md" | Button size |
| `className` | string | - | Additional classes |
| `variant` | "button" \| "dropdown" | "dropdown" | UI variant |
| `network` | string | "Base" | Network name |

## Usage Examples

### In StickyHeader (Desktop)
```tsx
<ConnectWalletButton
  isConnected={isConnected}
  address={address}
  balance={balance}
  onConnect={handleWalletConnect}
  onDisconnect={disconnectWallet}
  network="Base"
  variant="dropdown"
  size="md"
  className="hidden md:flex"
/>
```

### In Page Pre-Wallet View
```tsx
<ConnectWalletButton
  isConnected={false}
  onConnect={async (walletType) => {
    await connectWallet(walletType)
  }}
  variant="button"
  size="lg"
  className="mx-auto"
/>
```

### With Custom Wallet Type Handling
```tsx
const handleWalletConnect = async (walletType: string) => {
  switch(walletType) {
    case "metamask":
      await connectWallet("metamask")
      break
    case "walletconnect":
      await connectWallet("walletconnect")
      break
    default:
      await connectWallet(walletType)
  }
}

<ConnectWalletButton
  isConnected={isConnected}
  onConnect={handleWalletConnect}
  // ... other props
/>
```

## Styling

The component integrates with the platform's design system:

- **Primary Button**: Uses `btn-premium` class from button component
- **Glow Effect**: Includes `glow-button` class for subtle hover effects
- **Glass Card**: Dropdown uses `glass-card` styling
- **Colors**: Uses design tokens (accent, accent-foreground, etc.)

## States

### Disconnected State
- Shows "Connect Wallet" button
- Loading spinner during connection
- Uses `btn-premium` styling
- Includes wallet icon

### Connected State - Dropdown Variant
- Shows address (truncated format)
- Shows network badge
- Balance display in dropdown
- Copy address action
- View on BlockScan action
- Disconnect button

### Connected State - Button Variant
- Shows address with green pulse indicator
- Click to disconnect
- Compact display

## Integration Checklist

When using `ConnectWalletButton` in a new page or component:

- [ ] Import the component
- [ ] Get wallet context/state from `useWallet()` hook
- [ ] Pass `onConnect` callback
- [ ] Pass `onDisconnect` callback
- [ ] Pass current connection state (`isConnected`, `address`, `balance`)
- [ ] Choose variant (dropdown/button)
- [ ] Choose size (sm/md/lg)
- [ ] Add optional className for positioning

## Pages Updated

The following pages have been updated to use the standardized button:

1. **sticky-header.tsx** - Main navigation wallet button
   - Desktop header version
   - Mobile menu version
2. **portfolio/page.tsx** - Portfolio page
3. **swap/page.tsx** - Swap page
4. **taxes/page.tsx** - Tax report page
5. **lp-manager/page.tsx** - LP Manager page
6. **creators/page.tsx** - Creators page

## Wallet Context Integration

The component works seamlessly with the `useWallet()` hook:

```tsx
const { 
  address,           // Connected wallet address
  balance,           // ETH balance
  isConnected,       // Connection state
  connectWallet,     // Connect function
  disconnectWallet   // Disconnect function
} = useWallet()
```

## Mobile Responsive Behavior

- **Small (sm)**: 32px height, minimal padding
- **Medium (md)**: 40px height, standard padding (default)
- **Large (lg)**: 48px height, generous padding
- Desktop dropdown with network badge
- Mobile-optimized button layout

## Accessibility

- ARIA labels for button states
- Semantic HTML structure
- Keyboard navigable dropdown menu
- Loading state feedback
- Error handling feedback

## Future Enhancements

- Additional wallet provider support
- Multi-chain network selector
- Transaction history in dropdown
- Gas price display
- Token balance display
