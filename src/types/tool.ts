import { ComponentType, LazyExoticComponent } from "react";

export type ToolCategory = "dev" | "text" | "convert" | "image" | "design" | "crypto" | "media";

export interface CategoryInfo {
  id: ToolCategory;
  name: string;
  description: string;
  iconName: string;
}

export interface ToolDefinition {
  id: string; // unique slug e.g. "image-compressor"
  name: string; // Tool Display Name
  description: string;
  category: ToolCategory;
  tags?: string[];
  iconName?: string;
  status?: "stable" | "beta" | "placeholder";
  author?: string;
  component: LazyExoticComponent<ComponentType<unknown>> | ComponentType<unknown>;
}
