export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string;
          nama: string;
          email: string;
          telepon: string;
          alamat: string;
          tanggal_lahir: string;
          status_warga: "WNI" | "WNA";
          negara?: string | null;
          foto?: string | null;
        };
        Insert: {
          id?: string;
          nama: string;
          email: string;
          telepon: string;
          alamat: string;
          tanggal_lahir: string;
          status_warga: "WNI" | "WNA";
          negara?: string | null;
          foto?: string | null;
        };
        Update: {
          id?: string;
          nama?: string;
          email?: string;
          telepon?: string;
          alamat?: string;
          tanggal_lahir?: string;
          status_warga?: "WNI" | "WNA";
          negara?: string | null;
          foto?: string | null;
        };
      };
    };
  };
};
