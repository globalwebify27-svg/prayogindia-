"use client";

import React from "react";
import { AuthPortal } from "./AuthPortal";

export const LoginForm: React.FC = () => {
  return <AuthPortal initialMode="login" />;
};
