import styled from 'styled-components';

type ClickHandler = (data: unknown) => void;
type ButtonKind = 'default' | 'primary';

interface StyledButtonProps {
  readonly kind: ButtonKind;
}
type ButtonProps = Partial<StyledButtonProps> & {
  readonly clickHandler: ClickHandler;
};

const StyledButton = styled.button`
  min-width: 4rem;
  height: 4rem;
  display: flex;
  font-size: 3rem;
  color: #ffffff;
  justify-content: center;
  align-items: center;
  border: 4px solid ${(props: StyledButtonProps) => `var(--${props.kind}-border-color)`};
  border-radius: 7px;
  background: ${(props: StyledButtonProps) => `var(--${props.kind}-button)`};

  &:hover {
    filter: brightness(85%);
  }
`;

export const Button: React.FC<ButtonProps> = ({
  kind = 'default',
  clickHandler,
  children,
}) => {
  return (
    <StyledButton kind={kind} onClick={clickHandler}>
      {children}
    </StyledButton>
  );
};
