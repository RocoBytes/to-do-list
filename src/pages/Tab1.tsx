import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonInput,
  IonButton,
  IonIcon,
  IonLabel,
  IonTextarea,
} from '@ionic/react';
import { trash, create } from 'ionicons/icons';
import { useState } from 'react';
import './Tab1.css';

interface Tarea {
  id: number;
  titulo: string;
  descripcion: string;
}

const Tab1: React.FC = () => {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [nuevaTarea, setNuevaTarea] = useState<Tarea>({
    id: 0,
    titulo: '',
    descripcion: ''
  });
  const [modoEdicion, setModoEdicion] = useState(false);

  const handleDescripcionChange = (value: string | null | undefined) => {
    setNuevaTarea(prev => ({
      ...prev,
      descripcion: value || ''
    }));
  };

  const guardarTarea = () => {
    if (nuevaTarea.titulo.trim() === '') return;
    
    if (nuevaTarea.titulo.trim() === '' && nuevaTarea.descripcion.trim() === '') {
      return;
    }

    const tareaNueva = {
      ...nuevaTarea,
      id: Date.now()
    };

    if (modoEdicion) {
      setTareas(tareas.map(tarea => 
        tarea.id === nuevaTarea.id ? tareaNueva : tarea
      ));
      setModoEdicion(false);
    } else {
      setTareas(prev => [...prev, tareaNueva]);
    }

    setNuevaTarea({
      id: 0,
      titulo: '',
      descripcion: ''
    });
  };

  const editarTarea = (tarea: Tarea) => {
    setNuevaTarea(tarea);
    setModoEdicion(true);
  };

  const eliminarTarea = (id: number) => {
    setTareas(tareas.filter(tarea => tarea.id !== id));
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Lista de Tareas</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <form onSubmit={(e) => {
          e.preventDefault();
          guardarTarea();
        }}>
          <IonItem>
            <IonLabel position="stacked">Título</IonLabel>
            <IonInput
              value={nuevaTarea.titulo}
              onIonInput={e => setNuevaTarea({
                ...nuevaTarea,
                titulo: String((e.target as HTMLIonInputElement).value || '')
              })}
              placeholder="Ingresa el título"
              required
            />
          </IonItem>
          
          <IonItem>
            <IonLabel position="stacked">Descripción</IonLabel>
            <IonTextarea
              value={nuevaTarea.descripcion}
              onIonInput={e => handleDescripcionChange((e.target as HTMLIonTextareaElement).value)}
              rows={4}
              placeholder="Ingresa la descripción"
              required
            />
          </IonItem>

          <IonButton expand="block" type="submit">
            {modoEdicion ? 'Actualizar' : 'Guardar'} Tarea
          </IonButton>
        </form>

        <IonList>
          {tareas.map(tarea => (
            <IonItem key={tarea.id}>
              <IonLabel>
                <h2>{tarea.titulo}</h2>
                {tarea.descripcion && <p>{tarea.descripcion}</p>}
              </IonLabel>
              <IonButton 
                fill="clear"
                onClick={() => editarTarea(tarea)}
              >
                <IonIcon icon={create} />
              </IonButton>
              <IonButton 
                fill="clear" 
                color="danger"
                onClick={() => eliminarTarea(tarea.id)}
              >
                <IonIcon icon={trash} />
              </IonButton>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
