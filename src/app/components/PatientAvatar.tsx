import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const PATIENT_PHOTO_KEY = 'oncocare_patient_photo';

export function getPatientInitials(name?: string | null) {
  const parts = (name || 'Paciente')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'P';
}

export function getStoredPatientPhoto() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(PATIENT_PHOTO_KEY) || '';
}

export function setStoredPatientPhoto(photo: string) {
  window.localStorage.setItem(PATIENT_PHOTO_KEY, photo);
  window.dispatchEvent(new Event('oncocare-patient-photo-updated'));
}

export function clearStoredPatientPhoto() {
  window.localStorage.removeItem(PATIENT_PHOTO_KEY);
  window.dispatchEvent(new Event('oncocare-patient-photo-updated'));
}

export function PatientAvatar({ name, className = 'size-10' }: { name?: string | null; className?: string }) {
  const [photo, setPhoto] = useState('');

  useEffect(() => {
    function syncPhoto() {
      setPhoto(getStoredPatientPhoto());
    }

    syncPhoto();
    window.addEventListener('storage', syncPhoto);
    window.addEventListener('oncocare-patient-photo-updated', syncPhoto);

    return () => {
      window.removeEventListener('storage', syncPhoto);
      window.removeEventListener('oncocare-patient-photo-updated', syncPhoto);
    };
  }, []);

  return (
    <Avatar className={`${className} border border-rose-200 bg-rose-50`}>
      {photo && <AvatarImage src={photo} alt={name ? `Foto de ${name}` : 'Foto da paciente'} className="object-cover" />}
      <AvatarFallback className="bg-rose-100 font-semibold text-rose-800">
        {getPatientInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
