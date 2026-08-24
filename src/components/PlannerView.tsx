import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  Flame, 
  Check, 
  X, 
  ShieldAlert,
  Layers,
  Sparkles,
  Printer,
  SlidersHorizontal,
  GraduationCap
} from 'lucide-react';
import { 
  DayOfWeek, 
  TimetableSlot, 
  UserPreferences 
} from '../types';
import { 
  checkScheduleConflict, 
  formatTime12h, 
  parseTimeToMinutes 
} from '../lib/schedulingEngine';

interface PlannerViewProps {
  timetable: TimetableSlot[];
  preferences: UserPreferences;
  onUpdateTimetable: (slots: TimetableSlot[]) => void;
  onStartStudySession: (item: any) => void;
}

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
type BatchOption = 'ALL' | 'A' | 'B' | 'C' | 'D';

export const PlannerView: React.FC<PlannerViewProps> = ({
  timetable,
  preferences,
  onUpdateTimetable,
  onStartStudySession,
}) => {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');
  const [viewMode, setViewMode] = useState<'official' | 'day' | 'week'>('official');
  const [selectedBatch, setSelectedBatch] = useState<BatchOption>('ALL');
  
  // Timetable Edit/Add Slot Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);

  // Form fields
  const [formDay, setFormDay] = useState<DayOfWeek>('Monday');
  const [formStartTime, setFormStartTime] = useState('09:00');
  const [formEndTime, setFormEndTime] = useState('11:00');
  const [formTitle, setFormTitle] = useState('');
  const [formSubjectCode, setFormSubjectCode] = useState('OSY');
  const [formType, setFormType] = useState<TimetableSlot['type']>('lecture');
  const [formRoom, setFormRoom] = useState('ROOM NO 5');
  const [formInstructor, setFormInstructor] = useState('MRV');
  const [formNotes, setFormNotes] = useState('');

  // Conflict Testing Helper
  const [conflictTestStart, setConflictTestStart] = useState('16:30');
  const [conflictTestEnd, setConflictTestEnd] = useState('17:30');
  const activeConflict = checkScheduleConflict(selectedDay, conflictTestStart, conflictTestEnd, timetable, preferences);

  const openAddSlotModal = (day: DayOfWeek = selectedDay) => {
    setEditingSlot(null);
    setFormDay(day);
    setFormStartTime('09:00');
    setFormEndTime('11:00');
    setFormTitle('New Lecture / Lab');
    setFormSubjectCode('OSY');
    setFormType('lecture');
    setFormRoom('ROOM NO 5');
    setFormInstructor('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openEditSlotModal = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setFormDay(slot.day);
    setFormStartTime(slot.startTime);
    setFormEndTime(slot.endTime);
    setFormTitle(slot.title);
    setFormSubjectCode(slot.subjectCode || 'OSY');
    setFormType(slot.type);
    setFormRoom(slot.room || '');
    setFormInstructor(slot.instructor || '');
    setFormNotes(slot.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSlot) {
      // Edit existing
      const updated = timetable.map((s) =>
        s.id === editingSlot.id
          ? {
              ...s,
              day: formDay,
              startTime: formStartTime,
              endTime: formEndTime,
              title: formTitle,
              subjectCode: formSubjectCode,
              type: formType,
              room: formRoom,
              instructor: formInstructor,
              notes: formNotes,
            }
          : s
      );
      onUpdateTimetable(updated);
    } else {
      // Create new
      const newSlot: TimetableSlot = {
        id: `slot-${Date.now()}`,
        day: formDay,
        startTime: formStartTime,
        endTime: formEndTime,
        title: formTitle,
        subjectCode: formSubjectCode,
        type: formType,
        room: formRoom,
        instructor: formInstructor,
        notes: formNotes,
      };
      onUpdateTimetable([...timetable, newSlot]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteSlot = (id: string) => {
    onUpdateTimetable(timetable.filter((s) => s.id !== id));
    setIsModalOpen(false);
  };

  // Day slots sorted
  const currentDaySlots = timetable
    .filter((s) => s.day === selectedDay)
    .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));

  return (
    <div className="space-y-8 pb-16 font-sans">
      
      {/* Top Banner & View Switcher */}
      <section className="relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 md:p-8 bg-[#0C1214] border border-white/15 shadow-2xl">
        <div className="absolute right-0 bottom-0 text-8xl md:text-9xl font-bold tracking-tighter leading-none text-white/[0.03] select-none pointer-events-none uppercase">
          TIMETABLE
        </div>

        <div className="relative z-10 space-y-1.5">
          <div className="text-xs text-cyan-400 uppercase tracking-[0.25em] font-bold flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-cyan-400" />
            <span>02 / OFFICIAL ACADEMIC SCHEDULE</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-normal mt-0.5">
            Academic Year 2026-27 • TYCO-2
          </h2>
          <p className="text-sm text-white/70 tracking-wide">
            Vidyavardhini's Bhausaheb Vartak Polytechnic — Vasai Road (W) • Room No: 10
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          {/* View Toggle */}
          <div className="flex items-center p-1 bg-white/5 border border-white/15 text-xs">
            <button
              onClick={() => setViewMode('official')}
              className={`px-3.5 py-2 uppercase font-bold tracking-wider transition cursor-pointer text-xs ${
                viewMode === 'official' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
              }`}
            >
              Institutional Table
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3.5 py-2 uppercase font-bold tracking-wider transition cursor-pointer text-xs ${
                viewMode === 'day' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
              }`}
            >
              Day View
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3.5 py-2 uppercase font-bold tracking-wider transition cursor-pointer text-xs ${
                viewMode === 'week' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
              }`}
            >
              Week Grid
            </button>
          </div>

          <button
            onClick={() => openAddSlotModal(selectedDay)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-black hover:bg-cyan-400 text-xs font-bold uppercase tracking-wider transition cursor-pointer active:scale-95 shadow-md"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Entry</span>
          </button>
        </div>
      </section>

      {/* Batch Selection Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white/5 border border-white/10">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/70">
          <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
          <span className="font-bold">Select Practical Lab Batch:</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['ALL', 'A', 'B', 'C', 'D'] as BatchOption[]).map((batch) => (
            <button
              key={batch}
              onClick={() => setSelectedBatch(batch)}
              className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition border cursor-pointer ${
                selectedBatch === batch
                  ? 'bg-cyan-400 text-black border-cyan-400 shadow-sm'
                  : 'bg-black/40 text-white/70 hover:text-white hover:bg-white/10 border-white/15'
              }`}
            >
              {batch === 'ALL' ? 'All Batches (Full View)' : `Batch ${batch} (Only)`}
            </button>
          ))}
        </div>
      </div>

      {/* OFFICIAL INSTITUTIONAL TIMETABLE MATRIX (EXACT REPLICA OF THE IMAGE) */}
      {viewMode === 'official' && (
        <section className="bg-white text-black p-6 md:p-10 border-2 border-black shadow-2xl rounded-sm overflow-x-auto space-y-6">
          
          {/* Official Institution Header */}
          <div className="text-center space-y-1 border-b-2 border-black pb-4 relative">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {/* Emblem / Seal placeholder */}
              <div className="w-14 h-14 rounded-full border-2 border-black flex items-center justify-center p-1 font-bold text-[9px] text-center uppercase leading-none bg-neutral-100">
                <span>VBVP<br/>VASAI</span>
              </div>
              <div>
                <div className="text-base tracking-wide uppercase font-semibold">Vidyavardhini's</div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-normal uppercase">
                  Bhausaheb Vartak Polytechnic
                </h1>
                <div className="text-sm font-semibold tracking-wide">Vasai Road (W).</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 text-base font-bold px-2 flex-wrap gap-2">
              <div>Time Table TYCO-2</div>
              <div>Room No: 10</div>
              <div>Academic Year 2026-27</div>
            </div>
          </div>

          {/* Authentic Table Grid */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border-2 border-black text-center text-sm font-sans min-w-[760px]">
              <thead>
                <tr className="border-b-2 border-black font-bold bg-neutral-100 text-black">
                  <th className="border-r-2 border-black p-2.5 w-[110px] text-xs">DAY</th>
                  <th className="border-r-2 border-black p-2.5 w-[17%]">MON</th>
                  <th className="border-r-2 border-black p-2.5 w-[17%]">TUE</th>
                  <th className="border-r-2 border-black p-2.5 w-[18%]">WED</th>
                  <th className="border-r-2 border-black p-2.5 w-[18%]">THURS</th>
                  <th className="p-2.5 w-[17%]">FRI</th>
                </tr>
                <tr className="border-b-2 border-black font-bold bg-neutral-100 text-black">
                  <th className="border-r-2 border-black p-1 text-xs">TIME</th>
                  <th className="border-r-2 border-black p-1 text-xs"></th>
                  <th className="border-r-2 border-black p-1 text-xs"></th>
                  <th className="border-r-2 border-black p-1 text-xs"></th>
                  <th className="border-r-2 border-black p-1 text-xs"></th>
                  <th className="p-1 text-xs"></th>
                </tr>
              </thead>
              <tbody>
                
                {/* 09:00 - 11:00 (Spanning 09:00-10:00 & 10:00-11:00) */}
                <tr className="border-b-2 border-black">
                  <td className="border-r-2 border-black p-2 font-bold text-xs bg-neutral-50 leading-tight">
                    09:00-<br/>10:00<br/><br/>10:00-<br/>11:00
                  </td>
                  
                  {/* MON 09:00 - 11:00 */}
                  <td className="border-r-2 border-black p-3 font-semibold align-middle">
                    <div className="font-bold text-base">OSY (TH)</div>
                    <div className="text-xs">ROOM NO 5</div>
                    <div className="text-xs font-bold mt-1">MRV</div>
                  </td>

                  {/* TUE 09:00 - 11:00 */}
                  <td className="border-r-2 border-black p-3 font-semibold align-middle">
                    <div className="font-bold text-base">STE (TH)</div>
                    <div className="text-xs">ROOM NO 5</div>
                    <div className="text-xs font-bold mt-1">SSK</div>
                  </td>

                  {/* WED 09:00 - 11:00 (4 Practical Batches) */}
                  <td className="border-r-2 border-black p-1 align-middle">
                    <div className="grid grid-cols-4 gap-0 text-[11px] border border-black divide-x divide-black bg-white">
                      <div className={`p-1 ${selectedBatch === 'A' ? 'bg-cyan-100 font-bold' : ''}`}>
                        <div className="font-bold">A-PR</div>
                        <div>ENDS</div>
                        <div>L-12</div>
                        <div className="font-bold">VB</div>
                      </div>
                      <div className={`p-1 ${selectedBatch === 'B' ? 'bg-cyan-100 font-bold' : ''}`}>
                        <div className="font-bold">B-PR</div>
                        <div>STE</div>
                        <div>L-5</div>
                        <div className="font-bold">UVM</div>
                      </div>
                      <div className={`p-1 ${selectedBatch === 'C' ? 'bg-cyan-100 font-bold' : ''}`}>
                        <div className="font-bold">C-PR</div>
                        <div>STE</div>
                        <div>L-7</div>
                        <div className="font-bold">SSK</div>
                      </div>
                      <div className={`p-1 ${selectedBatch === 'D' ? 'bg-cyan-100 font-bold' : ''}`}>
                        <div className="font-bold">D-PR</div>
                        <div>OSY</div>
                        <div>L-4</div>
                        <div className="font-bold">MRV</div>
                      </div>
                    </div>
                  </td>

                  {/* THURS 09:00 - 11:00 (4 Practical Batches) */}
                  <td className="border-r-2 border-black p-1 align-middle">
                    <div className="grid grid-cols-4 gap-0 text-[11px] border border-black divide-x divide-black bg-white">
                      <div className={`p-1 ${selectedBatch === 'A' ? 'bg-cyan-100 font-bold' : ''}`}>
                        <div className="font-bold">A-PR</div>
                        <div>CLC</div>
                        <div>L-7</div>
                        <div className="font-bold">VB</div>
                      </div>
                      <div className={`p-1 ${selectedBatch === 'B' ? 'bg-cyan-100 font-bold' : ''}`}>
                        <div className="font-bold">B-PR</div>
                        <div>STE</div>
                        <div>L-11</div>
                        <div className="font-bold">UVM</div>
                      </div>
                      <div className={`p-1 ${selectedBatch === 'C' ? 'bg-cyan-100 font-bold' : ''}`}>
                        <div className="font-bold">C-PR</div>
                        <div>OSY</div>
                        <div>L-4</div>
                        <div className="font-bold">MRV</div>
                      </div>
                      <div className={`p-1 ${selectedBatch === 'D' ? 'bg-cyan-100 font-bold' : ''}`}>
                        <div className="font-bold">D-PR</div>
                        <div>STE</div>
                        <div>L-13</div>
                        <div className="font-bold">CG</div>
                      </div>
                    </div>
                  </td>

                  {/* FRI 09:00 - 11:00 */}
                  <td className="p-3 font-semibold align-middle">
                    <div className="font-bold text-base">OSY (TH)</div>
                    <div className="text-xs">ROOM NO 6</div>
                    <div className="text-xs font-bold mt-1">MRV</div>
                  </td>
                </tr>

                {/* 11:00 - 01:00 (Spanning 11:00-12:00 & 12:00-01:00) */}
                <tr className="border-b-2 border-black">
                  <td className="border-r-2 border-black p-2 font-bold text-xs bg-neutral-50 leading-tight">
                    11:00-<br/>12:00<br/><br/>12:00-<br/>01:00
                  </td>
                  
                  {/* MON 11:00 - 01:00 */}
                  <td className="border-r-2 border-black p-3 font-semibold align-middle">
                    <div className="font-bold text-base">CLC (TH)</div>
                    <div className="text-xs">ROOM NO 5</div>
                    <div className="text-xs font-bold mt-1">NKD</div>
                  </td>

                  {/* TUE 11:00 - 01:00 (4 Practical Batches) */}
                  <td className="border-r-2 border-black p-1 align-middle">
                    <div className="grid grid-cols-4 gap-0 text-[11px] border border-black divide-x divide-black bg-white">
                      <div className={`p-1 ${selectedBatch === 'A' ? 'bg-cyan-100 font-bold' : ''}`}>
                        <div className="font-bold">A-PR</div>
                        <div>STE</div>
                        <div>L-5</div>
                        <div className="font-bold">SSK</div>
                      </div>
                      <div className={`p-1 ${selectedBatch === 'B' ? 'bg-cyan-100 font-bold' : ''}`}>
                        <div className="font-bold">B-PR</div>
                        <div>OSY</div>
                        <div>L-4</div>
                        <div className="font-bold">MRV</div>
                      </div>
                      <div className={`p-1 ${selectedBatch === 'C' ? 'bg-cyan-100 font-bold' : ''}`}>
                        <div className="font-bold">C-PR</div>
                        <div>CLC</div>
                        <div>L-7</div>
                        <div className="font-bold">NKD</div>
                      </div>
                      <div className={`p-1 ${selectedBatch === 'D' ? 'bg-cyan-100 font-bold' : ''}`}>
                        <div className="font-bold">D-PR</div>
                        <div>STE</div>
                        <div>L-3</div>
                        <div className="font-bold">CG</div>
                      </div>
                    </div>
                  </td>

                  {/* WED 11:00 - 01:00 */}
                  <td className="border-r-2 border-black p-3 font-semibold align-middle">
                    <div className="font-bold text-base">CLC (TH)</div>
                    <div className="text-xs">ROOM NO 3</div>
                    <div className="text-xs font-bold mt-1">NKD</div>
                  </td>

                  {/* THURS 11:00 - 01:00 (4 Practical Batches) */}
                  <td className="border-r-2 border-black p-1 align-middle">
                    <div className="grid grid-cols-4 gap-0 text-[11px] border border-black divide-x divide-black bg-white">
                      <div className={`p-1 ${selectedBatch === 'A' ? 'bg-cyan-100 font-bold' : ''}`}>
                        <div className="font-bold">A-PR</div>
                        <div>OSY</div>
                        <div>L-4</div>
                        <div className="font-bold">BSP</div>
                      </div>
                      <div className={`p-1 ${selectedBatch === 'B' ? 'bg-cyan-100 font-bold' : ''}`}>
                        <div className="font-bold">B-PR</div>
                        <div>ENDS</div>
                        <div>L-8</div>
                        <div className="font-bold">VB</div>
                      </div>
                      <div className={`p-1 ${selectedBatch === 'C' ? 'bg-cyan-100 font-bold' : ''}`}>
                        <div className="font-bold">C-PR</div>
                        <div>STE</div>
                        <div>L-5</div>
                        <div className="font-bold">SSK</div>
                      </div>
                      <div className={`p-1 ${selectedBatch === 'D' ? 'bg-cyan-100 font-bold' : ''}`}>
                        <div className="font-bold">D-PR</div>
                        <div>CLC</div>
                        <div>L-7</div>
                        <div className="font-bold">NKD</div>
                      </div>
                    </div>
                  </td>

                  {/* FRI 11:00 - 01:00 */}
                  <td className="p-3 font-semibold align-middle">
                    <div className="font-bold text-base">STE (TH)</div>
                    <div className="text-xs">ROOM NO 6</div>
                    <div className="text-xs font-bold mt-1">SSK</div>
                  </td>
                </tr>

                {/* 01:00 - 01:30 (RECESS) */}
                <tr className="border-b-2 border-black bg-neutral-100 font-bold text-sm tracking-widest">
                  <td className="border-r-2 border-black p-1.5 text-xs bg-neutral-200">
                    01:00-01:30
                  </td>
                  <td colSpan={5} className="p-2 tracking-[0.3em] uppercase">
                    * * * * &nbsp; R E C E S S &nbsp; * * * *
                  </td>
                </tr>

                {/* 01:30 - 02:30 & 02:30 - 03:30 */}
                <tr className="border-b-2 border-black">
                  <td className="border-r-2 border-black p-2 font-bold text-xs bg-neutral-50 leading-tight">
                    01:30-<br/>02:30<br/><br/>02:30-<br/>03:30
                  </td>
                  
                  {/* MON 01:30 - 03:30 (Mentor Meeting from 01:30 to 02:30) */}
                  <td className="border-r-2 border-black p-2 align-top">
                    <div className="font-bold text-sm p-2 border-b border-dashed border-black">
                      MENTOR MEETING
                    </div>
                    <div className="text-xs text-neutral-400 p-2 italic">
                      —
                    </div>
                  </td>

                  {/* TUE 01:30 - 03:30 (01:30-02:30 OSY (TH) and 02:30-03:30 ENDS (TH)) */}
                  <td className="border-r-2 border-black p-1 align-top">
                    <div className="p-2 border-b-2 border-black">
                      <div className="font-bold text-sm">OSY (TH)</div>
                      <div className="text-xs">ROOM NO 5</div>
                      <div className="text-xs font-bold">MRV</div>
                    </div>
                    <div className="p-2">
                      <div className="font-bold text-sm">ENDS (TH)</div>
                      <div className="text-xs">ROOM NO 5</div>
                      <div className="text-xs font-bold">VB</div>
                    </div>
                  </td>

                  {/* WED 01:30 - 03:30 (4 Practical Batches) */}
                  <td className="border-r-2 border-black p-1 align-middle">
                    <div className="grid grid-cols-4 gap-0 text-[11px] border border-black divide-x divide-black bg-white">
                      <div className={`p-1 ${selectedBatch === 'A' ? 'bg-cyan-100 font-bold' : ''}`}>
                        <div className="font-bold">A-PR</div>
                        <div>STE</div>
                        <div>L-5</div>
                        <div className="font-bold">SSK</div>
                      </div>
                      <div className={`p-1 ${selectedBatch === 'B' ? 'bg-cyan-100 font-bold' : ''}`}>
                        <div className="font-bold">B-PR</div>
                        <div>CLC</div>
                        <div>L-7</div>
                        <div className="font-bold">NKD</div>
                      </div>
                      <div className={`p-1 ${selectedBatch === 'C' ? 'bg-cyan-100 font-bold' : ''}`}>
                        <div className="font-bold">C-PR</div>
                        <div>ENDS</div>
                        <div>L-11</div>
                        <div className="font-bold">MV</div>
                      </div>
                      <div className={`p-1 ${selectedBatch === 'D' ? 'bg-cyan-100 font-bold' : ''}`}>
                        <div className="font-bold">D-PR</div>
                        <div>ENDS</div>
                        <div>L-10</div>
                        <div className="font-bold">SR</div>
                      </div>
                    </div>
                  </td>

                  {/* THURS 01:30 - 03:30 (SPI Capstone Project) */}
                  <td className="border-r-2 border-black p-1 align-middle">
                    <div className="grid grid-cols-4 gap-0 text-[11px] border border-black divide-x divide-black bg-white">
                      <div className={`p-2 font-bold ${selectedBatch === 'A' ? 'bg-cyan-100' : ''}`}>A-SPI</div>
                      <div className={`p-2 font-bold ${selectedBatch === 'B' ? 'bg-cyan-100' : ''}`}>B-SPI</div>
                      <div className={`p-2 font-bold ${selectedBatch === 'C' ? 'bg-cyan-100' : ''}`}>C-SPI</div>
                      <div className={`p-2 font-bold ${selectedBatch === 'D' ? 'bg-cyan-100' : ''}`}>D-SPI</div>
                    </div>
                  </td>

                  {/* FRI 01:30 - 03:30 (Off) */}
                  <td className="p-3 text-xs text-neutral-400 italic align-middle">
                    —
                  </td>
                </tr>

              </tbody>
            </table>
          </div>

          {/* Official Faculty Legend Footer (Matching the image) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-2 border-black p-4 text-xs font-semibold bg-neutral-50 text-black">
            <div className="space-y-1">
              <div><strong>SSK:-</strong> MRS. SEEMA KAIMAL</div>
              <div><strong>NKD:-</strong> MRS. NILAKSHI DESHMUKH</div>
              <div><strong>UVM:-</strong> MRS. UTKARSHA MHATRE</div>
            </div>
            <div className="space-y-1 md:text-right">
              <div><strong>MRV:-</strong> MS. MAITRAYEE VARTAK</div>
              <div><strong>VB:-</strong> MSS. VAISHNAVI BHOIR</div>
              <div><strong>SR:-</strong> MS. SHEETAL RAJPUT</div>
            </div>
          </div>

        </section>
      )}

      {/* FIXED GYM NON-NEGOTIABLE NOTICE BANNER */}
      <div className="p-5 bg-orange-500/10 border border-orange-500/30 flex items-center justify-between flex-wrap gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-500 text-black font-bold">
            <Flame className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="font-bold text-orange-400 text-sm tracking-wider uppercase">
              Protected Commitment: Daily Gym 04:00 PM – 07:00 PM (Strict Lock)
            </div>
            <div className="text-xs text-white/75 mt-0.5">
              Non-negotiable physical health & recovery window. Academic study and revision cannot overlap this block.
            </div>
          </div>
        </div>
        <span className="px-3 py-1 bg-orange-500 text-black text-xs font-bold uppercase tracking-wider">
          Protected
        </span>
      </div>

      {/* DAY VIEW CONTENT */}
      {viewMode === 'day' && (
        <div className="space-y-4">
          
          {/* Day Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {DAYS.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                  selectedDay === d
                    ? 'bg-cyan-400 text-black border-cyan-400'
                    : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border-white/15'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>{selectedDay} Schedule</span>
              <span className="text-xs font-normal text-white/50">
                ({currentDaySlots.length} Items Configured)
              </span>
            </h3>
            <button
              onClick={() => openAddSlotModal(selectedDay)}
              className="text-xs text-cyan-400 hover:text-white font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Slot to {selectedDay}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {currentDaySlots.map((slot) => {
              const isFree = slot.type === 'free';
              const isRecess = slot.type === 'recess';

              return (
                <div
                  key={slot.id}
                  className={`p-5 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isFree
                      ? 'bg-emerald-500/[0.05] border-emerald-500/25 border-dashed'
                      : isRecess
                      ? 'bg-purple-500/[0.08] border-purple-500/25'
                      : 'bg-[#0C1214] border-white/15 hover:border-white/25'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="p-3 bg-white/5 border border-white/15 text-xs text-cyan-400 font-bold text-center min-w-[110px] uppercase">
                      <div>{formatTime12h(slot.startTime)}</div>
                      <div className="text-white/40 text-[10px]">TO</div>
                      <div>{formatTime12h(slot.endTime)}</div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {slot.subjectCode && (
                          <span className="px-2 py-0.5 bg-cyan-400/20 text-cyan-300 text-xs font-bold uppercase">
                            {slot.subjectCode}
                          </span>
                        )}
                        <span className="text-xs uppercase tracking-wider text-white/60 font-semibold">
                          {slot.type}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-white tracking-normal">
                        {slot.title}
                      </h4>
                      <div className="text-xs text-white/60 flex items-center gap-4 flex-wrap">
                        {slot.room && <span>📍 {slot.room}</span>}
                        {slot.instructor && <span>👨‍🏫 {slot.instructor}</span>}
                        {slot.notes && <span className="text-white/40">📝 {slot.notes}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {isFree && (
                      <button
                        onClick={() => onStartStudySession({ subjectCode: 'CLC', unitNumber: 2, title: 'CLC Study' })}
                        className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                      >
                        ⚡ Study Now
                      </button>
                    )}

                    <button
                      onClick={() => openEditSlotModal(slot)}
                      className="p-2 border border-white/15 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
                      title="Edit slot"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteSlot(slot.id)}
                      className="p-2 border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                      title="Delete slot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Daily Gym Block */}
            <div className="p-5 bg-orange-500/[0.08] border border-orange-500/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500/20 border border-orange-500/30 text-xs text-orange-400 font-bold text-center min-w-[110px]">
                  <div>04:00 PM</div>
                  <div className="text-orange-500/50 text-[10px]">TO</div>
                  <div>07:00 PM</div>
                </div>
                <div>
                  <span className="px-2 py-0.5 bg-orange-500/20 text-orange-300 text-xs font-bold uppercase tracking-wider">
                    Fixed Commitment
                  </span>
                  <h4 className="text-base font-bold text-white tracking-normal mt-1">
                    Daily Gym & Physical Fitness
                  </h4>
                  <p className="text-xs text-orange-400/85 mt-0.5">
                    Non-negotiable physical health block.
                  </p>
                </div>
              </div>
              <Flame className="w-6 h-6 text-orange-400 mr-2" />
            </div>

          </div>
        </div>
      )}

      {/* WEEK GRID VIEW */}
      {viewMode === 'week' && (
        <div className="p-6 border border-white/15 bg-[#0C1214] overflow-x-auto">
          <div className="grid grid-cols-7 gap-3 min-w-[900px]">
            {DAYS.map((day) => {
              const daySlots = timetable
                .filter((s) => s.day === day)
                .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));

              return (
                <div key={day} className="space-y-3">
                  <div className="p-3 bg-white/5 border border-white/15 text-center">
                    <div className="font-bold text-white text-sm uppercase">{day.slice(0, 3)}</div>
                    <div className="text-xs font-semibold text-cyan-400 uppercase">{daySlots.length} Classes</div>
                  </div>

                  <div className="space-y-2">
                    {daySlots.map((slot) => (
                      <div
                        key={slot.id}
                        onClick={() => openEditSlotModal(slot)}
                        className={`p-3 border text-xs cursor-pointer transition hover:border-cyan-400/50 ${
                          slot.type === 'free'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 border-dashed'
                            : slot.type === 'recess'
                            ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                            : 'bg-white/5 border-white/15 text-white/90'
                        }`}
                      >
                        <div className="font-bold text-cyan-300 uppercase truncate">{slot.title}</div>
                        <div className="text-[11px] text-white/50 mt-0.5">{slot.startTime}–{slot.endTime}</div>
                        {slot.room && <div className="text-[10px] text-white/40">{slot.room}</div>}
                      </div>
                    ))}

                    {/* Gym Block */}
                    <div className="p-2.5 bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase text-center tracking-wider">
                      Gym (4–7 PM)
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CONFLICT DETECTOR & RESOLUTION ENGINE */}
      <section className="p-6 md:p-8 border border-white/15 bg-[#0C1214] space-y-4">
        <div className="flex items-center gap-2 text-xs text-cyan-400 uppercase tracking-[0.25em] font-bold">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <span>03 / Real-Time Conflict Detector</span>
        </div>

        <div className="p-5 bg-white/5 border border-white/15 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="space-y-2">
            <div className="text-xs uppercase text-white/70 font-bold">Test Study Slot on {selectedDay}:</div>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={conflictTestStart}
                onChange={(e) => setConflictTestStart(e.target.value)}
                className="px-3 py-2 bg-[#080C0D] border border-white/20 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
              <span className="text-white/50 text-xs font-bold">TO</span>
              <input
                type="time"
                value={conflictTestEnd}
                onChange={(e) => setConflictTestEnd(e.target.value)}
                className="px-3 py-2 bg-[#080C0D] border border-white/20 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            {activeConflict ? (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 space-y-2">
                <div className="font-bold flex items-center gap-2 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Schedule Conflict Detected</span>
                </div>
                <p>
                  Overlaps with <strong className="text-white uppercase">{activeConflict.conflictingItem}</strong>. {activeConflict.blockedReason}
                </p>
                <div className="pt-1 flex items-center justify-between text-cyan-300 flex-wrap gap-2">
                  <span>💡 Suggestion: {activeConflict.suggestion}</span>
                  {activeConflict.suggestedSlot && (
                    <button
                      onClick={() => {
                        setConflictTestStart(activeConflict.suggestedSlot!.startTime);
                        setConflictTestEnd(activeConflict.suggestedSlot!.endTime);
                      }}
                      className="px-3 py-1.5 bg-cyan-400 text-black font-bold uppercase tracking-wider cursor-pointer hover:bg-cyan-300 transition"
                    >
                      Apply Alternative
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Zero conflicts! This slot is completely clear of College lectures, labs, and Gym.</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0C1214] p-6 border border-white/25 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-white/15 pb-4">
              <h3 className="text-xl font-bold text-white">
                {editingSlot ? 'Edit Timetable Entry' : 'Add New Timetable Slot'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-white/50 hover:text-white bg-white/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/70 block mb-1 font-semibold">Day of Week</label>
                  <select
                    value={formDay}
                    onChange={(e) => setFormDay(e.target.value as DayOfWeek)}
                    className="w-full px-3 py-2 bg-black border border-white/20 text-white focus:outline-none focus:border-cyan-400"
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d} className="bg-neutral-900 text-white">
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-white/70 block mb-1 font-semibold">Slot Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-black border border-white/20 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="lecture">Lecture (Theory)</option>
                    <option value="practical">Practical (Lab)</option>
                    <option value="mentor_meeting">Mentor Meeting</option>
                    <option value="free">Free Period / Buffer</option>
                    <option value="recess">Recess / Lunch</option>
                    <option value="study">Dedicated Study</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/70 block mb-1 font-semibold">Start Time (24h)</label>
                  <input
                    type="time"
                    required
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-white/20 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-white/70 block mb-1 font-semibold">End Time (24h)</label>
                  <input
                    type="time"
                    required
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-white/20 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-white/70 block mb-1 font-semibold">Title / Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. OSY (TH) or Practical Lab"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-white/20 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-white/70 block mb-1 font-semibold">Subject Code</label>
                  <input
                    type="text"
                    placeholder="OSY, CLC, STE, ENDS"
                    value={formSubjectCode}
                    onChange={(e) => setFormSubjectCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-black border border-white/20 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-white/70 block mb-1 font-semibold">Room / Lab</label>
                  <input
                    type="text"
                    placeholder="ROOM NO 5, L-4"
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-white/20 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-white/70 block mb-1 font-semibold">Faculty</label>
                  <input
                    type="text"
                    placeholder="MRV, NKD, SSK, VB"
                    value={formInstructor}
                    onChange={(e) => setFormInstructor(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-white/20 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-bold uppercase tracking-wider transition cursor-pointer"
                >
                  {editingSlot ? 'Save Changes' : 'Create Entry'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
