import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Car, Save, CheckCircle2, User, BusFront } from "lucide-react";
import { VEHICLE_MODELS, VehicleModel } from "../vehicleData";
import DrawingCanvas, { DrawingCanvasRef } from "./DrawingCanvas";

export default function DesignPage({ onBack, onPostMachine, userName, profileImage, userOro = 0, onDebitModel }: { 
  onBack: () => void;
  onPostMachine: (image: string, name: string, model: VehicleModel) => void;
  userName?: string;
  profileImage?: string;
  userOro?: number;
  onDebitModel?: (amount: number, description: string) => void;
}) {
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const [selectedModel, setSelectedModel] = useState<VehicleModel | null>(null);
  const [step, setStep] = useState<'selection' | 'drawing'>('selection');
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [machineName, setMachineName] = useState("");

  const handleSelectModel = (model: VehicleModel) => {
    setSelectedModel(model);
    setMachineName(model.name); // Set default name
  };

  const handleConfirmSelection = () => {
    if (selectedModel) {
      if (userOro < selectedModel.price) {
        alert(`Saldo insuficiente! Este modelo custa O$ ${selectedModel.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} e você possui apenas O$ ${userOro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Ganhe mais moedas antes de criar!`);
        return;
      }
      if (onDebitModel) {
        onDebitModel(selectedModel.price, `Compra de Chassi/Modelo: ${selectedModel.name}`);
      }
      setStep('drawing');
    }
  };

  if (step === 'selection') {
    return (
      <motion.div 
        key="selection"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-blue-600 flex flex-col items-center"
      >
        {/* Header Style from Image */}
        <main className="w-full px-4 pb-12 flex flex-col items-center relative pt-12">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-600/20 blur-[100px] -z-10 rounded-full" />
          <h1 className="text-2xl md:text-3xl text-white mb-6 drop-shadow-lg text-center font-bold">Escolha seu modelo</h1>

          {/* User Display */}
          <div className="bg-white rounded-xl p-4 flex flex-col items-center justify-center mb-6 shadow-sm mx-auto w-full max-w-2xl min-h-[100px]">
            <div className="w-16 h-16 bg-red-600 rounded-lg flex items-center justify-center mb-4 shadow-lg overflow-hidden">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User className="text-white w-10 h-10" />
              )}
            </div>
            <span className="text-gray-900 font-bold text-2xl uppercase tracking-widest italic">{userName || "Jogador"}</span>
          </div>

          {/* Models Grid */}
          <div 
            className="bg-white rounded-lg p-1 grid grid-cols-2 sm:grid-cols-4 border-2 border-gray-200 mb-8 overflow-hidden w-full max-w-2xl"
          >
            {VEHICLE_MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => handleSelectModel(model)}
                className={`flex flex-col items-center justify-center p-2 border-r border-b border-gray-100 last:border-b-0 group transition-all h-[80px] ${
                  selectedModel?.id === model.id ? 'bg-[rgb(251,251,0)]' : 'hover:bg-gray-50'
                }`}
              >
                <Car className={`w-6 h-6 mb-1 ${selectedModel?.id === model.id ? 'text-red-600' : 'text-gray-900'}`} />
                <span className="text-[15px] font-normal uppercase text-center leading-tight notranslate" translate="no">
                  {model.name}
                  <div className="text-red-600 font-bold">O$ {model.price.toLocaleString()}</div>
                </span>
              </button>
            ))}
          </div>

          {/* Selection Buttons */}
          <div className="w-full max-w-2xl space-y-4 relative z-20">
            <button
              type="button"
              disabled={!selectedModel}
              onClick={handleConfirmSelection}
              className={`w-full py-4 rounded-xl font-bold text-xl transition-all shadow-lg min-h-[55px] ${
                selectedModel 
                  ? 'bg-red-600 text-white active:translate-y-1' 
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              SELECIONAR
            </button>
            <button
              type="button"
              onClick={onBack}
              className="w-full py-4 bg-[#F3F4F6] text-gray-600 rounded-xl font-bold text-lg active:translate-y-1 transition-all cursor-pointer hover:bg-gray-200 relative z-[100]"
            >
              Não quero criar, so quero negociar
            </button>
          </div>

          {/* Selection Info */}
          <AnimatePresence>
            {selectedModel && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="w-full mt-12 bg-[#0E5B8C] rounded-[30px] p-8 text-white relative overflow-hidden"
              >
                <div className="relative z-10">
                  <h3 className="text-3xl md:text-4xl font-black mb-4 uppercase italic notranslate" translate="no">
                    {selectedModel.name}:
                  </h3>
                  <div className="space-y-2 text-xl font-bold">
                    {selectedModel.id === 'school-bus' && (
                      <p className="text-[rgb(251,251,0)] animate-pulse">
                        ESTA CARTA SÓ É VALIDA PARA O JOGO DE CARTA FISICA
                      </p>
                    )}
                  <div className="mt-6 space-y-3 text-lg bg-black/10 p-5 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center pt-2">
                       <span className="text-yellow-400 text-sm uppercase font-black">Valor da Montagem</span>
                       <span className="text-3xl font-black italic text-[rgb(251,251,0)]">O$ {selectedModel.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div className="flex items-center space-x-2 bg-black/20 p-3 rounded-2xl mt-4 border border-white/10 shadow-inner">
                      <div className="flex-1">
                        <p className="text-[10px] font-black uppercase text-white/50 tracking-widest">Capacidade</p>
                        <p className="text-xl font-black italic">30 LITROS</p>
                      </div>
                      <div className="w-px h-8 bg-white/10" />
                      <div className="flex-1">
                        <p className="text-[10px] font-black uppercase text-white/50 tracking-widest">Consumo</p>
                        <p className="text-xl font-black italic text-[rgb(251,251,0)]">8KM/LITROS</p>
                      </div>
                    </div>
                    <p className="mt-4">Potência: {selectedModel.power}</p>
                    <p>0-100: {selectedModel.acceleration}</p>
                  </div>
                  </div>
                </div>
                {selectedModel.id === 'school-bus' ? (
                  <BusFront className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10 transform -rotate-12" />
                ) : (
                  <Car className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10 transform -rotate-12" />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </motion.div>
    );
  }

  return (
    <motion.div 
      key="drawing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-blue-600 flex flex-col pt-20"
    >
      <div className="fixed top-4 left-4 z-40">
        <button onClick={() => setStep('selection')} className="p-2 bg-white rounded-full shadow-md text-gray-600 hover:text-red-600 transition-colors">
          <ArrowLeft />
        </button>
      </div>
      
      <main className="flex-1 p-4 md:p-6 flex flex-col items-center">
        <div className="max-w-5xl w-full space-y-6">
          <div className="flex flex-col items-center pb-2 ml-0 w-full">
             <button 
               onClick={() => setShowFinishModal(true)}
               className="w-full h-[60px] md:h-[40px] bg-[rgb(251,251,0)] hover:bg-yellow-500 text-gray-900 rounded-xl font-normal text-base uppercase not-italic shadow-lg shadow-yellow-200/50 transition-all active:scale-95 flex items-center justify-center space-x-2 active:translate-y-1"
             >
               <Save className="w-5 h-5 font-normal not-italic" />
               <span className="font-normal not-italic">CADASTRAR MÁQUINA</span>
             </button>
          </div>
          
          <h2 className="text-white text-[20px] mb-[2px] font-black italic text-center drop-shadow-md uppercase">
             FACA O DESIGN DA SUA MAQUINA
          </h2>
          
          <div className="pl-[12px] pt-[1px] pr-[17px]">
            <DrawingCanvas ref={canvasRef} />
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showFinishModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFinishModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl border-4 border-red-600"
            >
              <h2 className="text-2xl font-black text-center text-gray-900 mb-8 uppercase leading-tight italic">
                TEM CERTEZA QUE SUA MAQUINA ESTA PERFEITA?
              </h2>
              <div className="space-y-4">
                <button 
                  onClick={() => {
                    const image = canvasRef.current?.exportToImage();
                    setShowFinishModal(false);
                    if (image && selectedModel) {
                      onPostMachine(image, machineName, selectedModel);
                    } else if (selectedModel) {
                      // Fallback or error
                      onPostMachine("", machineName, selectedModel); 
                    }
                  }}
                  className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-xl shadow-lg active:translate-y-1 transition-all uppercase"
                >
                  POSTAR A MAQUINA
                </button>
                
                <button 
                  onClick={() => setShowFinishModal(false)}
                  className="w-full py-5 bg-gray-100 text-gray-600 rounded-2xl font-black text-xl active:translate-y-1 transition-all uppercase"
                >
                  voltar para prancheta
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
