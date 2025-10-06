import React from 'react';
import styled from 'styled-components';

const HeaderWrapper = styled.div`
  
`;

const Header: React.FC = () => {
  return (
    <HeaderWrapper>
      <html><head></head><body><header className="post-header"><h1 className="page-title">Home</h1></header></body></html>
    </HeaderWrapper>
  );
};

export default Header;
