```tsx
import React from 'react';
import styled from 'styled-components';

const MarqueeWrapper = styled.div`
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
`;

const MarqueeList = styled.ul`
  display: flex;
  white-space: nowrap;
  animation: marquee 10s linear infinite;
  padding: 0;
  margin: 0;

  @keyframes marquee {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(-100%);
    }
  }
`;

const MarqueeItem = styled.li`
  display: inline-flex;
  align-items: center;
  margin-right: 20px;
  color: transparent;

  img {
    width: 20px;
    height: 20px;
    color: transparent;
  }

  span {
    margin-left: 8px;
    color: transparent;
  }
`;

const marqueeItems = [
  { imgSrc: '/images/marquee/free-ship.png', alt: 'Free Shipping', label: 'Free Shipping' },
  { imgSrc: '/images/marquee/protect.png', alt: '100% Satisfaction Guarantee', label: '100% Satisfaction Guarantee' },
  { imgSrc: '/images/marquee/free-ship.png', alt: 'Free Shipping', label: 'Free Shipping' },
  { imgSrc: '/images/marquee/protect.png', alt: '100% Satisfaction Guarantee', label: '100% Satisfaction Guarantee' },
  { imgSrc: '/images/marquee/free-ship.png', alt: 'Free Shipping', label: 'Free Shipping' },
  { imgSrc: '/images/marquee/protect.png', alt: '100% Satisfaction Guarantee', label: '100% Satisfaction Guarantee' },
];

const Marquee: React.FC = () => {
  return (
    <MarqueeWrapper>
      <MarqueeList>
        {marqueeItems.map((item, index) => (
          <MarqueeItem key={index}>
            <img
              alt={item.alt}
              loading="lazy"
              srcSet={`${item.imgSrc}?w=32&q=75 1x, ${item.imgSrc}?w=48&q=75 2x`}
              src={`${item.imgSrc}?w=48&q=75`}
            />
            <span>{item.label}</span>
          </MarqueeItem>
        ))}
      </MarqueeList>
      <MarqueeList>
        {marqueeItems.map((item, index) => (
          <MarqueeItem key={index}>
            <img
              alt={item.alt}
              loading="lazy"
              srcSet={`${item.imgSrc}?w=32&q=75 1x, ${item.imgSrc}?w=48&q=75 2x`}
              src={`${item.imgSrc}?w=48&q=75`}
            />
            <span>{item.label}</span>
          </MarqueeItem>
        ))}
      </MarqueeList>
    </MarqueeWrapper>
  );
};

export default Marquee;
```

### Key Changes and Features:
1. **Styled Components**: Used `styled-components` for handling CSS instead of traditional CSS.
2. **Animation**: Implemented a simple marquee animation using keyframes.
3. **Responsive Design**: Basic responsiveness is achieved through percentage-based widths. Further refinements can be added as needed for specific breakpoints.
4. **TypeScript Integration**: The component is written in TypeScript, ensuring type safety.
5. **Reuse of Marquee Items**: The marquee items are abstracted into an array for clean rendering.