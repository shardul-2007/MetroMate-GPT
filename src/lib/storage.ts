"use client";
import type { Expense } from "@/types";
const KEY="metromate-expenses-v1";
export function readExpenses():Expense[]{try{const raw=localStorage.getItem(KEY);return raw?JSON.parse(raw) as Expense[]:[]}catch{return []}}
export function writeExpenses(items:Expense[]){try{localStorage.setItem(KEY,JSON.stringify(items))}catch{/* Browser storage may be unavailable. */}}
