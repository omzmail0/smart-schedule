import { useState, useEffect } from 'react';
import { db } from '../../utils/firebase';
import { collection, onSnapshot } from "firebase/firestore";

export const useUserData = (user) => {
  const [members, setMembers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [availability, setAvailability] = useState({});

  useEffect(() => {
    if (!user) return;
    const unsubMembers = onSnapshot(collection(db, "users"), (snap) => setMembers(snap.docs.map(d => d.data()).filter(u => u.role !== 'admin')));
    const unsubMeetings = onSnapshot(collection(db, "meetings"), (snap) => setMeetings(snap.docs.map(d => d.data())));
    const unsubAllAvail = onSnapshot(collection(db, "availability"), (snap) => {
       const data = {}; snap.forEach(d => { data[d.id] = d.data(); }); setAvailability(data);
    });
    return () => { unsubMembers(); unsubMeetings(); unsubAllAvail(); };
  }, [user]);

  return { members, meetings, availability };
};
