import React from 'react';
import styled from 'styled-components';
import { Backdrop } from '../Backdrop/Backdrop';

const Wrapper = styled.div`
  position: absolute;
  z-index: 500;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

export const Modal: React.FC = ({ children }) => {
  return (
    <>
      <Backdrop />
      <Wrapper>{children}</Wrapper>
    </>
  );
};
