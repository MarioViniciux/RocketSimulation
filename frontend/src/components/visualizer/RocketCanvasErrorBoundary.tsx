"use client";

import { Component, type ReactNode } from "react";

interface RocketCanvasErrorBoundaryProps {
  fallback: ReactNode;
  onError?: (error: unknown) => void;
  children: ReactNode;
}

interface RocketCanvasErrorBoundaryState {
  hasError: boolean;
}

/** Se a montagem do visualizador 3D (WebGL) falhar em tempo de execução
 * mesmo após a detecção de suporte indicar que era possível (ex.: driver
 * de GPU incompatível com algum recurso específico do Three.js), cai
 * para o `fallback` (a vista 2D) em vez de quebrar a página inteira.
 *
 * Nota: como todo error boundary do React, só captura erros durante a
 * renderização/montagem da árvore abaixo dele — não cobre falhas dentro
 * do loop de animação do react-three-fiber, que roda fora do ciclo de
 * renderização do React. A detecção de suporte via `useWebGLSupport` é
 * a defesa principal; isto é uma camada extra para a falha na montagem. */
export class RocketCanvasErrorBoundary extends Component<
  RocketCanvasErrorBoundaryProps,
  RocketCanvasErrorBoundaryState
> {
  state: RocketCanvasErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): RocketCanvasErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown): void {
    console.error("Falha ao renderizar o visualizador 3D; usando o fallback 2D.", error);
    this.props.onError?.(error);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
