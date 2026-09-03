import { Component, ErrorInfo, ReactNode } from 'react';
import {
  TkCard,
  TkCardHeader,
  TkCardTitle,
  TkCardContent,
} from 'thinkube-style/components/cards-data';
import { TkCodeBlock } from 'thinkube-style/components/feedback';
import i18n from '@/i18n';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error boundary caught:', error, errorInfo.componentStack);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <TkCard>
        <TkCardHeader>
          <TkCardTitle>{i18n.t('errors.boundary.title')}</TkCardTitle>
        </TkCardHeader>
        <TkCardContent>
          <details>
            <summary className="cursor-pointer font-semibold mb-2">
              {i18n.t('errors.boundary.details')}
            </summary>
            <div className="space-y-2">
              <div>{this.state.error?.toString()}</div>
              {this.state.error?.stack && <TkCodeBlock>{this.state.error.stack}</TkCodeBlock>}
              {this.state.errorInfo?.componentStack && (
                <TkCodeBlock>{this.state.errorInfo.componentStack}</TkCodeBlock>
              )}
            </div>
          </details>
        </TkCardContent>
      </TkCard>
    );
  }
}
