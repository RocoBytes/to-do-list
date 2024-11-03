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

  const guardarTarea = () => {
    if (nuevaTarea.titulo.trim() === '') return;

    if (modoEdicion) {
      setTareas(tareas.map(tarea => 
        tarea.id === nuevaTarea.id ? nuevaTarea : tarea
      ));
      setModoEdicion(false);
    } else {
      setTareas([...tareas, {
        ...nuevaTarea,
        id: Date.now()
      }]);
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
              onIonChange={e => setNuevaTarea({
                ...nuevaTarea,
                titulo: e.detail.value || ''
              })}
              required
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Descripción</IonLabel>
            <IonTextarea
              value={nuevaTarea.descripcion}
              onIonChange={e => setNuevaTarea({
                ...nuevaTarea,
                descripcion: e.detail.value || ''
              })}
              rows={4}
              placeholder="Escribe la descripción de la tarea..."
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
                <p>{tarea.descripcion}</p>
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
