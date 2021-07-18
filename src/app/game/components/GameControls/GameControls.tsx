import React, { HTMLAttributes, memo } from 'react';
import styled from 'styled-components';

const StyledGameControls = styled.div`
  position: absolute;
  z-index: 2;
  padding: 2rem;
`;

export const GameControls: React.FC<HTMLAttributes<unknown>> = memo(
  ({ children, style }) => {
    return <StyledGameControls style={style}>{children}</StyledGameControls>;
  }
);

GameControls.displayName = 'GameControl';
