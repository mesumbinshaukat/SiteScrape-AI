Here’s how you could convert the provided HTML, CSS, and JavaScript code into a React functional component using TypeScript and styled-components:

```tsx
import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

// Define the types for marquee items
type MarqueeItem = {
  id: number;
  image: string;
  alt: string;
  text: string;
};

// Marquee items data
const marqueeItems: MarqueeItem[] = [
  {
    id: 1,
    image: '/_next/image?url=%2Fimages%2Fmarquee%2Ffree-ship.png&width=48&q=75',
    alt: 'Free Shipping',
    text: 'Free Shipping',
  },
  {
    id: 2,
    image: '/_next/image?url=%2Fimages%2Fmarquee%2Fprotect.png&width=48&q=75',
    alt: '100% Satisfaction Guarantee',
    text: '100% Satisfaction Guarantee',
  },
  // Repeat items for a scrolling effect
  {
    id: 3,
    image: '/_next/image?url=%2Fimages%2Fmarquee%2Ffree-ship.png&width=48&q=75',
    alt: 'Free Shipping',
    text: 'Free Shipping',
  },
  {
    id: 4,
    image: '/_next/image?url=%2Fimages%2Fmarquee%2Fprotect.png&width=48&q=75',
    alt: '100% Satisfaction Guarantee',
    text: '100% Satisfaction Guarantee',
  },
];

const MarqueeContainer = styled(motion.main)`
  position: relative;
  overflow: hidden;
  height: 100%;
  color: transparent;
`;

const MarqueeWrapper = styled.div`
  display: flex;
  animation: marquee 10s linear infinite;
  @keyframes marquee {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(-100%);
    }
  }
`;

const MarqueeList = styled.ul`
  display: flex;
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

const MarqueeItem = styled.li`
  display: flex;
  align-items: center;
  margin-right: 20px; // adjust spacing as per design
`;

const MarqueeImage = styled.img`
  width: 20px;
  height: 20px;
  margin-right: 5px;
  color: transparent;
`;

const Marquee: React.FC = () => {
  return (
    <MarqueeContainer>
      <MarqueeWrapper>
        <MarqueeList>
          {marqueeItems.map((item) => (
            <MarqueeItem key={item.id}>
              <MarqueeImage
                alt={item.alt}
                loading="lazy"
                src={item.image}
              />
              <span>{item.text}</span>
            </MarqueeItem>
          ))}
        </MarqueeList>
        <MarqueeList>
          {marqueeItems.map((item) => (
            <MarqueeItem key={item.id}>
              <MarqueeImage
                alt={item.alt}
                loading="lazy"
                src={item.image}
              />
              <span>{item.text}</span>
            </MarqueeItem>
          ))}
        </MarqueeList>
      </MarqueeWrapper>
    </MarqueeContainer>
  );
};

export default Marquee;
```

### Explanation:
- **TypeScript Types**: Defined `MarqueeItem` to represent each item's properties.
- **Styled-Components**: Created styled components to replicate the original styles and behaviors, including the marquee animation.
- **Marquee Animation**: Used CSS animations with a keyframe defined within the styled component.
- **Dynamically Rendered Items**: Mapped over `marqueeItems` to dynamically create list items.
- **Framer Motion**: While basic animations are handled with pure CSS, you can incorporate Framer Motion more extensively for complex interactions if needed.

Make sure to adjust paths for images or any other assets in your project. For a production environment, you may want to properly handle loading states or image optimization as well.