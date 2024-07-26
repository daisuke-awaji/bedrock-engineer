import { StackStatus } from "@aws-sdk/client-cloudformation";
import { STACK_STATUS } from "../constants";

function isStackStatus(value: any): value is StackStatus {
  return Object.values(STACK_STATUS).includes(value);
}

export function isStackStatuses(value: any[]): value is StackStatus[] {
  return Array.isArray(value) && value.every(isStackStatus);
}
