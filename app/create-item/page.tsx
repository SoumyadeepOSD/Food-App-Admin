/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import LeftPanel from '../_components/manage-items/left-panel';
import RightPanel from '../_components/manage-items/right-panel';
import { useSelector } from 'react-redux';
import LoadingComponent from '../_components/loading-component';

const CreateItems = () => {
  const isLoading = useSelector((state: any) => state.loading.isLoading);
  if (isLoading) {
    return <LoadingComponent />
  } else {
    return (
      <div className="bg-slate-200 flex flex-row items-start gap-5 w-screen h-screen text-black p-5">
        <Toaster />
        <LeftPanel />
        <RightPanel />
      </div>
    );
  }
};

export default CreateItems;
