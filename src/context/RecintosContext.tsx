import { Recinto } from '@/types/recinto';
import { createContext, ReactNode, useContext, useState } from 'react';

interface RecintosContextType {
    recintos: Recinto[];
    selectedRecintoId: number | null;
    baseRecintos: Recinto[];
    setRecintos: (recintos: Recinto[]) => void;
    setSelectedRecintoId: (id: number | null) => void;
    setBaseRecintos: (recintos: Recinto[]) => void;
    addRecinto: (recinto: Recinto) => void;
    updateRecinto: (id: number, updates: Partial<Recinto>) => void;
    deleteRecinto: (id: number) => void;
    createBaseRecinto: (recinto: Recinto) => void;
}

const RecintosContext = createContext<RecintosContextType | undefined>(undefined);

export function RecintosProvider({ children }: { children: ReactNode }) {
    const [recintos, setRecintos] = useState<Recinto[]>([]);
    const [selectedRecintoId, setSelectedRecintoId] = useState<number | null>(null);
    const [baseRecintos, setBaseRecintos] = useState<Recinto[]>([]);

    // Add a new recinto 
    const addRecinto = (recinto: Recinto) => {
        setRecintos(prev => [...prev, recinto]);
    };

    // Update an existing recinto
    const updateRecinto = (id: number, updates: Partial<Recinto>) => {
        setRecintos(prev => prev.map(r =>
            r.id === id ? { ...r, ...updates } : r
        ));
    };

    // Delete a recinto
    const deleteRecinto = (id: number) => {
        setRecintos(prev => prev.filter(r => r.id !== id));
    };

    // Create a base recinto with base values
    const createBaseRecinto = (recinto: Recinto) => {
        const baseRecinto: Recinto = {
            ...recinto,
            base_demanda_calef: recinto.demanda_calef || 0,
            base_demanda_ref: recinto.demanda_ref || 0,
            base_demanda_ilum: recinto.demanda_ilum || 0,
            base_demanda_total: (recinto.demanda_calef || 0) + (recinto.demanda_ref || 0) + (recinto.demanda_ilum || 0),
            base_consumo_calef: recinto.consumo_calef || 0,
            base_consumo_ref: recinto.consumo_ref || 0,
            base_consumo_total: (recinto.consumo_calef || 0) + (recinto.consumo_ref || 0),
            base_co2eq_total: recinto.co2_eq_total || 0
        };

        setBaseRecintos(prev => [...prev, baseRecinto]);
    };

    return (
        <RecintosContext.Provider value={{
            recintos,
            selectedRecintoId,
            baseRecintos,
            setRecintos,
            setSelectedRecintoId,
            setBaseRecintos,
            addRecinto,
            updateRecinto,
            deleteRecinto,
            createBaseRecinto
        }}>
            {children}
        </RecintosContext.Provider>
    );
}

export function useRecintos() {
    const context = useContext(RecintosContext);
    if (context === undefined) {
        throw new Error('useRecintos must be used within a RecintosProvider');
    }
    return context;
}
