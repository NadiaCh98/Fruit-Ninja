import React, { PropsWithChildren } from 'react';
import { ErrorInfo } from 'react';

interface AppErrorBoundaryState {
  readonly error?: Error;
  readonly errorInfo?: ErrorInfo;
}

export class AppErrorBoundary extends React.Component<
  PropsWithChildren<unknown>,
  AppErrorBoundaryState
> {
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ error, errorInfo });
  }

  render(): React.ReactNode {
    if (this.state?.errorInfo && this.state?.error) {
      return (
        <div>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}
