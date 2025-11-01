import { create } from "zustand";

interface GeneralState {
    generalIsLoading: boolean;
}

const useGeneralStore = create<GeneralState>((set, get) => ({
    generalIsLoading: false,

}));

export default useGeneralStore;
