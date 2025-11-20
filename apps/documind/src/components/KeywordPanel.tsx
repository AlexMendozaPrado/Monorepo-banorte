import { LoadingProgress, KeywordsSkeleton, LoadingStage } from "./LoadingStates";

interface KeywordPanelProps {
  keywords: string[];
  isLoading?: boolean;
  loadingStage?: LoadingStage;
  progress?: number;
}

export default function KeywordPanel({
  keywords,
  isLoading = false,
  loadingStage = 'analyzing',
  progress
}: KeywordPanelProps) {
  const hasKeywords = keywords.length > 0;
  const defaultImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuDku6_yc6XS7wRGeFOehQjXreqPp6RDW26XGHZCeYGHU6lOA-Qe7x-44_gjOwmv7kqjxxoFGIhyHiij86UZhUOFvkkaAzXaTUoo0iLgasFQlKeQxeigmfSoXAE600Jc-kYkOBuXxiGo3gACJka7febdLKrAAm-xny7GR8GZuYjFdPST9d174cf79_iIQzB2ZKNf7zgPT4m3_SASlGvWq686E-B0vPnwqkDi06wKtRXzDEMMQc1EqME5tmeKTz1I3UV4PaZey38tKLA";
  const placeholderKeywords = ["IA", "Modelo", "Documento", "Análisis", "Extracción"];
  const items = hasKeywords ? keywords : placeholderKeywords;

  return (
    <aside className="w-full lg:w-[360px]">
      <h2 className="text-textPrimary text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
        Palabras Clave
      </h2>
      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col px-4 py-6">
          <LoadingProgress stage={loadingStage} progress={progress} />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !hasKeywords && (
        <div className="flex flex-col px-4 py-6">
          <div className="flex flex-col items-center gap-6">
            <div
              className="bg-center bg-no-repeat aspect-video bg-cover rounded-xl w-full max-w-[360px]"
              style={{ backgroundImage: `url(${defaultImage})` }}
            ></div>
            <div className="flex max-w-[480px] flex-col items-center gap-2">
              <p className="text-textPrimary text-lg font-bold leading-tight tracking-[-0.015em] text-center">
                Sube un documento para ver las palabras clave
              </p>
              <p className="text-textSecondary text-sm font-normal leading-normal text-center">
                Las palabras clave se extraerán automáticamente utilizando un modelo de IA.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Keywords Display */}
      {!isLoading && (
        <div className="flex gap-3 p-3 flex-wrap pr-4">
          {items.map((tag, index) => (
            <div
              key={`${tag}-${index}`}
              className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-surface1 pl-4 pr-4"
            >
              <p className="text-textPrimary text-sm font-medium leading-normal">{tag}</p>
            </div>
          ))}
        </div>
      )}

      {/* Keywords Skeleton while loading */}
      {isLoading && loadingStage === 'analyzing' && (
        <KeywordsSkeleton />
      )}
    </aside>
  );
}
