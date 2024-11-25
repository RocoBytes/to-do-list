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
  IonModal,
} from '@ionic/react';
import { trash, create, camera } from 'ionicons/icons';
import { useState } from 'react';
import './Tab1.css';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
// Definición de la interfaz Tarea o la estructura inicial del Todo
interface Tarea {
  id: number;
  titulo: string;
  descripcion?: string;
  imagen?: string;
}
const Tab1: React.FC = () => {
  // Estado para almacenar la lista de tareas, inicializa con un array vacío (Estado por usar useState)
  const [tareas, setTareas] = useState<Tarea[]>([]);
  
  // Estado para almacenar la nueva tarea que se está creando o editando (Estado por usar useState)
  const [nuevaTarea, setNuevaTarea] = useState<Tarea>({
    id: 0,
    titulo: '',
    descripcion: ''
  });

  // Estado para indicar si estamos en modo de edición (Estado por usar useState)
  const [modoEdicion, setModoEdicion] = useState(false);

  // Estado para controlar la visibilidad del modal
  const [mostrarModal, setMostrarModal] = useState(false);

  // Función para manejar el cambio en la descripción de la tarea
  const handleDescripcionChange = (value: string | null | undefined) => {
    setNuevaTarea(prev => ({
      ...prev,
      descripcion: value || ''
    }));
  };

  // Función para guardar una nueva tarea o actualizar una existente
  const guardarTarea = () => {
    // Validar que el título no esté vacío
    if (nuevaTarea.titulo.trim() === '') return;
    
    // Validar que tanto el título como la descripción no estén vacíos
    if (nuevaTarea.titulo.trim() === '' && (!nuevaTarea.descripcion || nuevaTarea.descripcion.trim() === '')) {
      return;
    }

    // Crear una nueva tarea con un ID único
    const tareaNueva = {
      ...nuevaTarea,
      id: Date.now()
    };

    if (modoEdicion) {
      // Si estamos en modo de edición, actualizar la tarea existente
      setTareas(tareas.map(tarea => 
        tarea.id === nuevaTarea.id ? tareaNueva : tarea
      ));
      setModoEdicion(false);
    } else {
      // Si no estamos en modo de edición, agregar la nueva tarea a la lista
      setTareas(prev => [...prev, tareaNueva]);
    }

    // Resetear el estado de nuevaTarea
    setNuevaTarea({
      id: 0,
      titulo: '',
      descripcion: ''
    });

    // Cerrar el modal
    setMostrarModal(false);
  };

  // Función para editar una tarea existente
  const editarTarea = (tarea: Tarea) => {
    setNuevaTarea(tarea);
    setModoEdicion(true);
    setMostrarModal(true);
  };

  // Función para eliminar una tarea
  const eliminarTarea = (id: number) => {
    setTareas(tareas.filter(tarea => tarea.id !== id));
  };

  // Función para tomar foto
  const tomarFoto = async () => {
    try {
      const imagen = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera
      });
      
      setNuevaTarea(prev => ({
        ...prev,
        imagen: `data:image/jpeg;base64,${imagen.base64String}`
      }));
    } catch (error) {
      console.error('Error al capturar imagen:', error);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Lista de Tareas</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <form onSubmit={guardarTarea}>
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

          <IonItem>
            {nuevaTarea.imagen && (
              <img 
                src={nuevaTarea.imagen} 
                alt="Imagen de la tarea" 
                style={{ maxWidth: '200px', marginBottom: '10px' }}
              />
            )}
            <IonButton type="button" onClick={tomarFoto}>
              <IonIcon icon={camera} slot="start" />
              Tomar Foto
            </IonButton>
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
                {tarea.imagen && (
                  <img 
                    src={tarea.imagen} 
                    alt="Imagen de la tarea" 
                    style={{ maxWidth: '200px', marginTop: '10px' }}
                  />
                )}
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

        <IonModal isOpen={mostrarModal} onDidDismiss={() => setMostrarModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>{modoEdicion ? 'Editar Tarea' : 'Nueva Tarea'}</IonTitle>
              <IonButton slot="end" onClick={() => setMostrarModal(false)}>Cerrar</IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <form onSubmit={guardarTarea}>
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

              <IonItem>
                {nuevaTarea.imagen && (
                  <img 
                    src={nuevaTarea.imagen} 
                    alt="Imagen de la tarea" 
                    style={{ maxWidth: '200px', marginBottom: '10px' }}
                  />
                )}
                <IonButton type="button" onClick={tomarFoto}>
                  <IonIcon icon={camera} slot="start" />
                  Tomar Foto
                </IonButton>
              </IonItem>

              <IonButton expand="block" type="submit">
                {modoEdicion ? 'Actualizar' : 'Guardar'} Tarea
              </IonButton>
            </form>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
