Here's the converted React functional component using TypeScript. The design and structure are preserved with appropriate usage of styled-components for styling, and the initial functionality encapsulated within the component.

```tsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

// Define styled components
const Main = styled.main`
  position: relative;
  overflow: hidden;
`;

const MarqueeWrapper = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  color: transparent;
`;

const MarqueeList = styled.ul`
  display: flex;
  width: 360px;
  transition: transform 1s linear;
`;

const MarqueeItem = styled.li`
  display: flex;
  align-items: center;
  margin: 0 10px;
  
  img {
    color: transparent; // maintain the transparent style
  }
`;

const Marquee: React.FC = () => {
  const [marqueePosition, setMarqueePosition] = useState<number>(0);
  const [marqueeSpeed] = useState<number>(2); // Adjust speed as needed

  const items = [
    { alt: 'Free Shipping', src: '/images/marquee/free-ship.png', text: 'Free Shipping' },
    { alt: '100% Satisfaction Guarantee', src: '/images/marquee/protect.png', text: '100% Satisfaction Guarantee' },
    { alt: 'Free Shipping', src: '/images/marquee/free-ship.png', text: 'Free Shipping' },
    { alt: '100% Satisfaction Guarantee', src: '/images/marquee/protect.png', text: '100% Satisfaction Guarantee' },
    { alt: 'Free Shipping', src: '/images/marquee/free-ship.png', text: 'Free Shipping' },
    { alt: '100% Satisfaction Guarantee', src: '/images/marquee/protect.png', text: '100% Satisfaction Guarantee' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMarqueePosition((prev) => (prev - marqueeSpeed) % -360);
    }, 100); // Adjust the interval for speed

    return () => clearInterval(interval);
  }, [marqueeSpeed]);

  return (
    <Main>
      <MarqueeWrapper>
        <MarqueeList style={{ transform: `translateX(${marqueePosition}px)` }}>
          {items.map((item, index) => (
            <MarqueeItem key={index}>
              <img
                alt={item.alt}
                loading="lazy"
                width="20"
                height="20"
                srcSet={`${item.src}?w=32&q=75 1x, ${item.src}?w=48&q=75 2x`}
                src={`${item.src}?w=48&q=75`}
              />
              <span>{item.text}</span>
            </MarqueeItem>
          ))}
        </MarqueeList>
      </MarqueeWrapper>
    </Main>
  );
};

export default Marquee;
```

### Explanation:
1. **Styled Components**: The CSS styles have been migrated to styled-components. This allows for clean and manageable styling within the components.
2. **State Management**: State is managed using the `useState` hook for managing the marquee's position.
3. **Animation Logic**: The marquee movement is handled within a `setInterval`, with the position being updated every 100 ms.
4. **TypeScript**: The component is fully typed with TypeScript to enhance type safety.
5. **Responsiveness**: Flex properties and margin adjustments make it responsive as per the initial requirements. You may modify items and their arrangement for different screen sizes if necessary.