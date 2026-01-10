import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Video configuration - puede ser URL de YouTube/Vimeo, o ruta de archivo local
  videoUrl?: string;
  videoType?: "youtube" | "vimeo" | "local" | "url";
}

// Función helper para detectar el tipo de video desde la URL
function detectVideoType(url: string): "youtube" | "vimeo" | "local" | "url" {
  if (!url) return "local";
  
  if (url.includes("youtube.com/watch") || url.includes("youtu.be/")) {
    return "youtube";
  }
  if (url.includes("vimeo.com/")) {
    return "vimeo";
  }
  if (url.startsWith("/") || url.startsWith("./")) {
    return "local";
  }
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return "url";
  }
  return "local";
}

// Función para convertir URL de YouTube a formato embed
function getYouTubeEmbedUrl(url: string): string {
  // Manejar diferentes formatos de URL de YouTube
  // youtu.be/VIDEO_ID, youtube.com/watch?v=VIDEO_ID, youtube.com/embed/VIDEO_ID
  let videoId: string | null = null;
  
  // Formato corto: youtu.be/VIDEO_ID
  if (url.includes("youtu.be/")) {
    const match = url.match(/youtu\.be\/([^?#&]+)/);
    videoId = match ? match[1] : null;
  }
  // Formato largo: youtube.com/watch?v=VIDEO_ID
  else if (url.includes("youtube.com/watch")) {
    const match = url.match(/[?&]v=([^?#&]+)/);
    videoId = match ? match[1] : null;
  }
  // Formato embed: youtube.com/embed/VIDEO_ID
  else if (url.includes("youtube.com/embed/")) {
    const match = url.match(/embed\/([^?#&]+)/);
    videoId = match ? match[1] : null;
  }
  
  // Verificar que el video ID tenga 11 caracteres (formato estándar de YouTube)
  if (videoId && videoId.length === 11) {
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1`;
  }
  
  return url;
}

// Función para convertir URL de Vimeo a formato embed
function getVimeoEmbedUrl(url: string): string {
  const regExp = /(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i;
  const match = url.match(regExp);
  const videoId = match ? match[1] : null;
  return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
}

// Función helper para renderizar texto con formato markdown (negrita **texto**)
function renderFormattedText(text: string) {
  // Dividir el texto por ** para detectar negritas
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      // Es texto en negrita
      const boldText = part.slice(2, -2); // Remover los **
      return (
        <strong key={index} className="font-semibold text-primary">
          {boldText}
        </strong>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export function HelpDialog({ 
  open, 
  onOpenChange,
  videoUrl,
  videoType: propVideoType
}: HelpDialogProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState(0); // 0:intro, 1:wallet info, 2:terms
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Detectar tipo de video si no se proporciona explícitamente
  const detectedType = videoUrl ? detectVideoType(videoUrl) : "local";
  const videoType = propVideoType || detectedType;
  
  // Si no hay videoUrl, usar placeholder
  const hasVideo = !!videoUrl;

  // Reset step cuando se abre el dialog
  useEffect(() => {
    if (open) {
      setStep(0);
      setIsPlaying(false);
      setIsMuted(true);
    }
  }, [open]);

  // Manejar play/pause del video local
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Manejar mute/unmute del video local
  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Renderizar placeholder de video oscuro con botón dummy
  const renderVideoPlayer = () => {
    // Si hay una URL de video, usar el reproductor normal
    if (hasVideo && videoUrl) {
      if (videoType === "youtube") {
        const embedUrl = getYouTubeEmbedUrl(videoUrl);
        return (
          <div className="aspect-video w-full overflow-hidden rounded-md border bg-black">
            <iframe
              src={embedUrl}
              title={t("video_intro_title")}
              className="w-full h-full"
              frameBorder={0}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        );
      }

      if (videoType === "vimeo") {
        const embedUrl = getVimeoEmbedUrl(videoUrl);
        return (
          <div className="aspect-video w-full overflow-hidden rounded-md border bg-black">
            <iframe
              src={embedUrl}
              title={t("video_intro_title")}
              className="w-full h-full"
              frameBorder={0}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }

      // Video local o URL directa
      return (
        <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-black group">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain"
            playsInline
            muted={isMuted}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          >
            Your browser does not support the video tag.
          </video>
          
          {/* Controles personalizados */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="icon"
                onClick={handlePlayPause}
                className="rounded-full bg-black/70 text-white hover:bg-black/90 border-0"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" />
                )}
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={handleMuteToggle}
                className="rounded-full bg-black/70 text-white hover:bg-black/90 border-0"
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Placeholder oscuro con botón dummy
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-md border border-gray-700 bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center group">
        {/* Patrón de fondo sutil */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        {/* Botón dummy clickeable */}
        <button
          onClick={() => {
            // Acción dummy - puedes cambiarla después
            console.log("Video placeholder clicked");
            // Puedes agregar aquí la lógica que necesites
            // Por ejemplo: abrir un modal, navegar a una URL, etc.
          }}
          className="rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 backdrop-blur-sm z-10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black/50"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-75"></div>
              <Play className="h-8 w-8 ml-1 relative z-10" fill="currentColor" />
            </div>
            <span className="text-sm font-medium mt-1">{t("video_intro_title", "Watch this quick guide")}</span>
          </div>
        </button>
        
        {/* Indicador de placeholder - opcional, puedes comentarlo si no lo quieres */}
        {/* <div className="absolute bottom-2 right-2 text-xs text-gray-400 opacity-50">
          {t("video_placeholder_text", "Video placeholder")}
        </div> */}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-6 max-h-[90vh] overflow-y-auto font-secondary">
        <DialogHeader>
          {step === 0 && (
            <>
              <DialogTitle className="text-2xl font-bold text-primary mb-1">
                {t("help_and_tutorials")}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {t("help_description")}
              </DialogDescription>
            </>
          )}
          {step === 1 && (
            <>
              <DialogTitle className="text-2xl font-bold text-primary mb-1">
                {t("help_step2_title", "Kioscoin wallet")}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {t("kioskoin_onboarding_subtitle")}
              </DialogDescription>
            </>
          )}
          {step === 2 && (
            <>
              <DialogTitle className="text-2xl font-bold text-primary mb-1">
                {t("help_step3_title", "Acepto Términos y condiciones")}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {t("kioskoin_onboarding_subtitle")}
              </DialogDescription>
            </>
          )}
        </DialogHeader>

        {step === 0 && (
          <>
            {/* Video Section */}
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-primary mb-1">
                  📺 {t("video_intro_title")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("video_intro_description")}
                </p>
              </div>
              {renderVideoPlayer()}
            </div>

            {/* Help Sections */}
            <div className="space-y-6 mt-6 text-sm leading-relaxed text-gray-700">
              <section className="space-y-2">
                <h3 className="font-semibold text-base text-primary">
                  {t("getting_started")}
                </h3>
                <ol className="list-decimal list-inside pl-4 space-y-1.5">
                  {t("getting_started_description")
                    .split("\n")
                    .filter(line => line.trim().length > 0)
                    .map((line, i) => (
                      <li key={i} className="text-muted-foreground">
                        {line.replace(/^\d+\.\s/, "")}
                      </li>
                    ))}
                </ol>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-base text-primary">
                  {t("how_to_trade")}
                </h3>
                <ol className="list-decimal list-inside pl-4 space-y-1.5">
                  {t("how_to_trade_description")
                    .split("\n")
                    .filter(line => line.trim().length > 0)
                    .map((line, i) => {
                      const trimmedLine = line.trim();
                      // Detectar si es una línea especial que empieza con **
                      const isSpecialNote = trimmedLine.startsWith("**");
                      const cleanLine = line.replace(/^\d+\.\s/, "");
                      
                      // Si es una nota especial, renderizarla como elemento destacado
                      if (isSpecialNote) {
                        return (
                          <li 
                            key={i} 
                            className="list-none ml-[-1rem] pl-0 mt-3 mb-2"
                          >
                            <div className="bg-secondary/10 p-3 rounded-lg border-l-4 border-primary shadow-sm">
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {renderFormattedText(trimmedLine)}
                              </p>
                            </div>
                          </li>
                        );
                      }
                      
                      return (
                        <li key={i} className="text-muted-foreground">
                          {renderFormattedText(cleanLine)}
                        </li>
                      );
                    })}
                </ol>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-base text-primary">
                  {t("safety_tips")}
                </h3>
                <ul className="list-disc list-inside pl-4 space-y-1.5">
                  {t("safety_tips_description")
                    .split("\n")
                    .filter(line => line.trim().length > 0)
                    .map((tip, i) => (
                      <li key={i} className="text-muted-foreground">
                        {tip.replace(/^•\s/, "")}
                      </li>
                    ))}
                </ul>
              </section>
            </div>
          </>
        )}

        {step === 1 && (
          <div className="space-y-4 mt-4 text-sm leading-relaxed text-gray-700">
            {/* Sección: Tu dirección Kioscoin */}
            <div className="bg-secondary/5 rounded-lg p-4 border border-secondary/10 space-y-3">
              <h3 className="font-semibold text-base text-primary mb-2">
                {t("wallet_step_address_title", "Your Kioscoin address")}
              </h3>
              <div className="space-y-2">
                {t("wallet_step_address_desc", "This is your Kioscoin wallet address. Share it to receive funds.")
                  .split("\n")
                  .filter(line => line.trim().length > 0)
                  .map((line, i) => {
                    const trimmedLine = line.trim();
                    const isSpecialNote = trimmedLine.startsWith("**");
                    
                    if (isSpecialNote) {
                      return (
                        <div key={i} className="bg-primary/10 p-3 rounded-lg border-l-4 border-primary shadow-sm mt-2">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {renderFormattedText(trimmedLine)}
                          </p>
                        </div>
                      );
                    }
                    
                    return (
                      <p key={i} className="text-muted-foreground leading-relaxed">
                        {renderFormattedText(trimmedLine)}
                      </p>
                    );
                  })}
              </div>
            </div>

            {/* Sección: Recibir */}
            <div className="bg-secondary/5 rounded-lg p-4 border border-secondary/10 space-y-3">
              <h3 className="font-semibold text-base text-primary mb-2">
                {t("wallet_step_receive_title", "Receive")}
              </h3>
              <div className="space-y-2">
                {t("wallet_step_receive_desc", "Deposit stablecoins into your Kioscoin wallet using your address.")
                  .split("\n")
                  .filter(line => line.trim().length > 0)
                  .map((line, i) => {
                    const trimmedLine = line.trim();
                    const isSpecialNote = trimmedLine.startsWith("**");
                    
                    if (isSpecialNote) {
                      return (
                        <div key={i} className="bg-primary/10 p-3 rounded-lg border-l-4 border-primary shadow-sm mt-2">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {renderFormattedText(trimmedLine)}
                          </p>
                        </div>
                      );
                    }
                    
                    return (
                      <p key={i} className="text-muted-foreground leading-relaxed">
                        {renderFormattedText(trimmedLine)}
                      </p>
                    );
                  })}
              </div>
            </div>

            {/* Sección: Enviar */}
            <div className="bg-secondary/5 rounded-lg p-4 border border-secondary/10 space-y-3">
              <h3 className="font-semibold text-base text-primary mb-2">
                {t("wallet_step_send_title", "Send")}
              </h3>
              <div className="space-y-2">
                {t("wallet_step_send_desc", "Transfer stablecoins from your Kioscoin wallet to an external address.")
                  .split("\n")
                  .filter(line => line.trim().length > 0)
                  .map((line, i) => {
                    const trimmedLine = line.trim();
                    const isSpecialNote = trimmedLine.startsWith("**");
                    
                    if (isSpecialNote) {
                      return (
                        <div key={i} className="bg-primary/10 p-3 rounded-lg border-l-4 border-primary shadow-sm mt-2">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {renderFormattedText(trimmedLine)}
                          </p>
                        </div>
                      );
                    }
                    
                    return (
                      <p key={i} className="text-muted-foreground leading-relaxed">
                        {renderFormattedText(trimmedLine)}
                      </p>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 mt-4 text-sm leading-relaxed text-gray-700">
            <div className="bg-secondary/5 rounded-lg p-4 border border-secondary/10">
              <h3 className="font-semibold text-base text-primary mb-3">
                {t("help_step3_title", "Acepto Términos y condiciones")}
              </h3>
              <ul className="list-disc list-inside pl-2 space-y-2">
                {t("help_step3_lines")
                  .split("\n")
                  .filter(line => line.trim().length > 0)
                  .map((line, i) => (
                    <li key={i} className="text-muted-foreground">
                      {line}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        )}

        {/* Footer navigation */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="flex space-x-2">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`h-2 w-2 rounded-full transition-all ${
                    i === step ? "bg-primary w-6" : "bg-gray-200 hover:bg-gray-300"
                  }`}
                  aria-label={`${t("go_to_step", "Go to step")} ${i + 1}`}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                className="font-secondary"
              >
                {t("previous", "Previous")}
              </Button>
            )}
            {step < 2 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-muted-foreground hover:text-primary font-secondary"
              >
                {t("skip", "Skip")}
              </Button>
            )}
            <Button
              size="sm"
              onClick={() =>
                step === 2 ? onOpenChange(false) : setStep((s) => Math.min(2, s + 1))
              }
              className="bg-secondary text-white hover:bg-secondary/90 font-secondary"
            >
              {step === 2 ? t("help_accept_tyc", "Acepto TyC") : t("next", "Next")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
