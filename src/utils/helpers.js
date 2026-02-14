// src/utils/helpers.js

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const generateAccessCode = () => {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
};

export const HOURS = Array.from({ length: 13 }, (_, i) => i + 10); 

export const getStartOfWeek = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay(); 
  const diff = d.getDate() - (day === 6 ? 0 : day + 1);
  return new Date(d.setDate(diff));
};

export const getWeekDays = (startDate) => {
  const dates = [];
  const start = new Date(startDate);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d);
  }
  return dates;
};

export const getSlotId = (date, hour) => {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}-${hour}`;
};

export const isPastTime = (date, hour) => {
  const now = new Date();
  const check = new Date(date);
  check.setHours(hour, 0, 0, 0);
  return check < now;
};

export const formatDate = (date) => new Date(date).toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'short' });

export const formatTime = (hour) => {
  const h = hour > 12 ? hour - 12 : hour;
  const ampm = hour >= 12 ? 'م' : 'ص';
  return `${h}:00 ${ampm}`;
};
