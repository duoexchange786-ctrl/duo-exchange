'use client';
import React, { Suspense } from 'react';
import DepositAmountComponent from './DepositAmountComponent';

export default function DepositAmount() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DepositAmountComponent />
    </Suspense>
  );
}
