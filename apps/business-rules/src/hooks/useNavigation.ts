'use client';

import { useRouter } from 'next/navigation';

export const useNavigation = () => {
  const router = useRouter();

  const goToLogin = () => {
    router.push('/login');
  };

  const goToRegister = () => {
    router.push('/register');
  };

  const goToForgotPassword = () => {
    router.push('/forgot-password');
  };

  const goToDashboard = () => {
    router.push('/dashboard');
  };

  const goToReports = () => {
    router.push('/reportes');
  };

  const goToReglas = () => {
    router.push('/reglas');
  };

  const goToSimulador = () => {
    router.push('/simulador');
  };

  const goToHistorial = () => {
    router.push('/historial');
  };

  const goToMapeoXML = () => {
    router.push('/mapeo-xml');
  };

  const goBack = () => {
    router.back();
  };

  const goTo = (path: string) => {
    router.push(path);
  };

  return {
    goToLogin,
    goToRegister,
    goToForgotPassword,
    goToDashboard,
    goToReports,
    goToReglas,
    goToSimulador,
    goToHistorial,
    goToMapeoXML,
    goBack,
    goTo
  };
};
