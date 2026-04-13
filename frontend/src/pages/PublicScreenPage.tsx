import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { publicApi } from '@/services/api';
import { useAudio } from '@/hooks/useAudio';
import { cn } from '@/lib/utils';
import type { AppointmentDetails, RecentCall, SettingItem } from '@/types';
import { Monitor, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { API_BASE } from '@/services/api';

export default function PublicScreenPage() {
  const { locationId: locationIdParam } = useParams<{ locationId: string }>();
  const locationId = Number(locationIdParam) || 1;

  const [appointments, setAppointments] = useState<AppointmentDetails[]>([]);
  const [recentCalls, setRecentCalls] = useState<RecentCall[]>([]);
  const [config, setConfig] = useState<Record<string, string>>({});
  const [currentCall, setCurrentCall] = useState<RecentCall | null>(null);
  const [time, setTime] = useState(new Date());
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const { speak, isSupported } = useAudio({
    lang: config['AUDIO_VOICE_LANG'] ?? 'es-AR',
    rate: config['AUDIO_VOICE_RATE'] ? Number(config['AUDIO_VOICE_RATE']) : 0.9,
    pitch: config['AUDIO_VOICE_PITCH'] ? Number(config['AUDIO_VOICE_PITCH']) : 1,
  });

  // Clock
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Load initial data
  useEffect(() => {
    publicApi.appointments(locationId).then(setAppointments).catch(() => {});
    publicApi.calls(locationId, 8).then((data) => {
      setRecentCalls(data);
      if (data.length > 0) setCurrentCall(data[0]);
    }).catch(() => {});
    publicApi.settings(locationId).then((items) => {
      const map: Record<string, string> = {};
      items.forEach((c) => { map[c.key] = c.value; });
      setConfig(map);
    }).catch(() => {});
  }, [locationId]);

  // Socket connection (public, no auth)
  useEffect(() => {
    const socket = io(API_BASE || '/', {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join:location', locationId);
    });

    const handleCall = (data: { appointment: AppointmentDetails; audioText?: string | null }) => {
      setCurrentCall({
        id: Date.now(),
        appointment_id: data.appointment.id,
        called_at: new Date().toISOString(),
        retry_count: 0,
        display_text: `${data.appointment.ticket_number} - ${data.appointment.patient_first_name ?? ''} ${data.appointment.patient_last_name ?? ''}`,
        audio_text: data.audioText ?? null,
        ticket_number: data.appointment.ticket_number,
        patient_first_name: data.appointment.patient_first_name,
        patient_last_name: data.appointment.patient_last_name,
        office_name: data.appointment.office_name,
        office_code: data.appointment.office_code,
        professional_first_name: data.appointment.professional_first_name,
        professional_last_name: data.appointment.professional_last_name,
      });

      setRecentCalls((prev) => {
        const newCall: RecentCall = {
          id: Date.now(),
          appointment_id: data.appointment.id,
          called_at: new Date().toISOString(),
          retry_count: 0,
          display_text: null,
          audio_text: data.audioText ?? null,
          ticket_number: data.appointment.ticket_number,
          patient_first_name: data.appointment.patient_first_name,
          patient_last_name: data.appointment.patient_last_name,
          office_name: data.appointment.office_name,
          office_code: data.appointment.office_code,
          professional_first_name: data.appointment.professional_first_name,
          professional_last_name: data.appointment.professional_last_name,
        };
        return [newCall, ...prev].slice(0, 8);
      });

      // Speak
      if (data.audioText && audioEnabled && isSupported) {
        speak(data.audioText);
      }

      // Update appointments list
      setAppointments((prev) =>
        prev.map((a) => (a.id === data.appointment.id ? data.appointment : a)),
      );
    };

    const handleUpdate = (data: { appointment: AppointmentDetails }) => {
      setAppointments((prev) => {
        const exists = prev.find((a) => a.id === data.appointment.id);
        if (exists) {
          return prev.map((a) => (a.id === data.appointment.id ? data.appointment : a));
        }
        return [...prev, data.appointment];
      });
    };

    socket.on('appointment:called', handleCall);
    socket.on('appointment:recalled', handleCall);
    socket.on('appointment:in_service', handleUpdate);
    socket.on('appointment:completed', handleUpdate);
    socket.on('appointment:absent', handleUpdate);
    socket.on('appointment:cancelled', handleUpdate);
    socket.on('appointment:updated', handleUpdate);

    return () => {
      socket.emit('leave:location', locationId);
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationId]);

  // Speak when audioEnabled changes for current call replays
  useEffect(() => {
    if (currentCall?.audio_text && audioEnabled && isSupported) {
      // speak on audio toggle is intentional for testing
    }
  }, [audioEnabled]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const waitingAppointments = appointments.filter((a) => a.status === 'WAITING');
  const inServiceAppointments = appointments.filter((a) => a.status === 'IN_SERVICE');
  const institutionName = config['INSTITUTION_NAME'] ?? 'MediQ';

  return (
    <div className="flex h-screen flex-col bg-slate-900 text-white overflow-hidden select-none">
      {/* Header */}
      <header className="flex items-center justify-between bg-slate-800 px-8 py-4">
        <div className="flex items-center gap-3">
          <Monitor className="h-8 w-8 text-blue-400" />
          <h1 className="text-2xl font-bold">{institutionName}</h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setAudioEnabled(!audioEnabled)} className="p-2 rounded hover:bg-slate-700 transition-colors">
            {audioEnabled ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6 text-slate-500" />}
          </button>
          <button onClick={toggleFullscreen} className="p-2 rounded hover:bg-slate-700 transition-colors">
            {isFullscreen ? <Minimize className="h-6 w-6" /> : <Maximize className="h-6 w-6" />}
          </button>
          <div className="text-right">
            <p className="text-3xl font-mono font-bold tabular-nums">
              {time.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-xs text-slate-400">
              {time.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main area -- current call */}
        <div className="flex flex-1 flex-col items-center justify-center p-8">
          {currentCall ? (
            <div className="w-full max-w-2xl animate-pulse-call">
              <div className="rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 p-10 text-center shadow-2xl">
                <p className="text-lg font-medium text-yellow-100 uppercase tracking-wider mb-3">
                  Llamando
                </p>
                <p className="text-8xl font-bold mb-4">{currentCall.ticket_number}</p>
                <p className="text-3xl font-semibold">
                  {currentCall.patient_first_name} {currentCall.patient_last_name}
                </p>
                <div className="mt-6 rounded-xl bg-white/20 px-6 py-3">
                  <p className="text-2xl font-medium">
                    {currentCall.office_name ?? currentCall.office_code}
                  </p>
                  <p className="text-lg text-yellow-100">
                    {currentCall.professional_first_name} {currentCall.professional_last_name}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-500">
              <Monitor className="mx-auto h-24 w-24 mb-4" />
              <p className="text-2xl">Esperando llamados...</p>
            </div>
          )}
        </div>

        {/* Sidebar -- recent calls + queue */}
        <aside className="w-96 bg-slate-800 flex flex-col overflow-hidden">
          {/* Recent calls */}
          <div className="flex-1 overflow-auto p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Llamados Recientes
            </h3>
            <div className="space-y-2">
              {recentCalls.map((call, index) => (
                <div
                  key={call.id}
                  className={cn(
                    'rounded-lg p-3 transition-all',
                    index === 0 ? 'bg-yellow-500/20 border border-yellow-500/40' : 'bg-slate-700/50',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold font-mono">{call.ticket_number}</span>
                    <span className="text-sm text-slate-400">
                      {call.office_name ?? call.office_code}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 mt-0.5">
                    {call.patient_first_name} {call.patient_last_name}
                  </p>
                </div>
              ))}
              {recentCalls.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-8">Sin llamados recientes</p>
              )}
            </div>
          </div>

          {/* Queue count */}
          <div className="border-t border-slate-700 p-4">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-lg bg-blue-500/20 p-3">
                <p className="text-3xl font-bold text-blue-400">{waitingAppointments.length}</p>
                <p className="text-xs text-blue-300">En Espera</p>
              </div>
              <div className="rounded-lg bg-green-500/20 p-3">
                <p className="text-3xl font-bold text-green-400">{inServiceAppointments.length}</p>
                <p className="text-xs text-green-300">En Atencion</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
