"use client";

import React from "react";
import { AuthPortal } from "./AuthPortal";

export const RegisterForm: React.FC = () => {
  return <AuthPortal initialMode="register" />;
};
