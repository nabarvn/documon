import {
  createContext,
  useState,
  Dispatch,
  SetStateAction,
  ReactNode,
} from "react";

type Pages = {
  numPages: number | undefined;
  setNumPages: Dispatch<SetStateAction<number | undefined>>;
};

export const DocumentContext = createContext<Pages>({
  numPages: undefined,
  setNumPages: () => {},
});

interface DocumentContextProps {
  children: ReactNode;
}

export const DocumentContextProvider = ({ children }: DocumentContextProps) => {
  const [numPages, setNumPages] = useState<number>();

  return (
    <DocumentContext.Provider value={{ numPages, setNumPages }}>
      {children}
    </DocumentContext.Provider>
  );
};
