import styled from 'styled-components';

const StyledButton = styled.button`
  width: 4rem;
  height: 4rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 4px solid rgba(96, 42, 0, 1);
  border-radius: 7px;
  background: linear-gradient(rgba(142, 78, 1, 1) 0%, rgba(96, 42, 0, 1) 100%);
`;

export type ClickHandler = (data: unknown) => void;

interface ButtonProps {
  readonly clickHandler: ClickHandler;
}

export const Button: React.FC<ButtonProps> = ({ clickHandler, children }) => {
  return <StyledButton onClick={clickHandler}>{children}</StyledButton>;
};
