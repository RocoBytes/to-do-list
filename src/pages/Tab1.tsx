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
  IonToast,
  IonButtons,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/react';
import { trash, create, camera } from 'ionicons/icons';
import { useState, useEffect } from 'react';
import './Tab1.css';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
// Definición de la interfaz Tarea o la estructura inicial del Todo
interface Tarea {
  id: number;
  titulo: string;
  descripcion?: string;
  imagen?: string;
  ubicacion?: {
    latitude: number;
    longitude: number;
  };
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

  // Estado para controlar la visibilidad del toast
  const [mostrarToast, setMostrarToast] = useState(false);

  // Función para manejar el cambio en la descripción de la tarea
  const handleDescripcionChange = (value: string | null | undefined) => {
    setNuevaTarea(prev => ({
      ...prev,
      descripcion: value || ''
    }));
  };

  // Función para obtener la ubicación actual
  const obtenerUbicacion = async () => {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      setNuevaTarea(prev => ({
        ...prev,
        ubicacion: {
          latitude: coordinates.coords.latitude,
          longitude: coordinates.coords.longitude
        }
      }));
    } catch (error) {
      console.error('Error al obtener ubicación:', error);
    }
  };

  // Función para guardar una nueva tarea o actualizar una existente
  const guardarTarea = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (nuevaTarea.titulo.trim() === '') return;
    
    const tareaNueva = {
      ...nuevaTarea,
      id: modoEdicion ? nuevaTarea.id : Date.now(),
      imagen: nuevaTarea.imagen
    };

    try {
      await obtenerUbicacion();

      // Crear el array actualizado de tareas
      const tareasActualizadas = modoEdicion ? 
        tareas.map(tarea => tarea.id === tareaNueva.id ? tareaNueva : tarea) :
        [...tareas, tareaNueva];

      // Actualizar el estado
      setTareas(tareasActualizadas);
      
      // Guardar en localStorage
      localStorage.setItem('tareas', JSON.stringify(tareasActualizadas));

      setNuevaTarea({
        id: 0,
        titulo: '',
        descripcion: '',
        imagen: undefined,
        ubicacion: undefined
      });

      setMostrarModal(false);
      setMostrarToast(true);

    } catch (error) {
      console.error('Error al guardar la tarea:', error);
    }
  };

  // Añadir useEffect para cargar tareas guardadas
  useEffect(() => {
    const tareasGuardadas = localStorage.getItem('tareas');
    if (tareasGuardadas) {
      setTareas(JSON.parse(tareasGuardadas));
    }
  }, []);

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

  // Función para sincronizar tareas con la API
  const sincronizarConAPI = async () => {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/todos');
      const tareasAPI = await response.json();
      
      // Convertir el formato de la API a nuestro formato
      const tareasFormateadas: Tarea[] = tareasAPI.slice(0, 5).map((item: any) => ({
        id: item.id,
        titulo: item.title,
        descripcion: `Tarea importada - Estado: ${item.completed ? 'Completada' : 'Pendiente'}`,
        ubicacion: undefined,
        imagen: undefined
      }));

      // Combinar tareas existentes con las nuevas
      const tareasActualizadas = [...tareas, ...tareasFormateadas];
      setTareas(tareasActualizadas);
      localStorage.setItem('tareas', JSON.stringify(tareasActualizadas));
      setMostrarToast(true);
    } catch (error) {
      console.error('Error al sincronizar con API:', error);
    }
  };

  // Función para el pull-to-refresh
  const handleRefresh = async (event: CustomEvent) => {
    await sincronizarConAPI();
    event.detail.complete();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Lista de Tareas</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        {/* Botón para sincronización manual */}
        <IonButton expand="block" onClick={sincronizarConAPI}>
          Importar Tareas desde API
        </IonButton>

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
                    style={{
                      width: '100%',
                      maxWidth: '300px',
                      marginTop: '10px',
                      borderRadius: '8px'
                    }}
                  />
                )}
                {tarea.ubicacion && (
                  <p style={{ fontSize: '0.9em', color: '#666' }}>
                    📍 Lat: {tarea.ubicacion.latitude.toFixed(4)}, 
                    Long: {tarea.ubicacion.longitude.toFixed(4)}
                  </p>
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
              <IonButtons slot="end">
                <IonButton onClick={() => setMostrarModal(false)}>Cerrar</IonButton>
              </IonButtons>
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

              {nuevaTarea.ubicacion && (
                <IonItem>
                  <IonLabel>
                    <p>📍 Ubicación actual:</p>
                    <p>Latitud: {nuevaTarea.ubicacion.latitude.toFixed(4)}</p>
                    <p>Longitud: {nuevaTarea.ubicacion.longitude.toFixed(4)}</p>
                  </IonLabel>
                </IonItem>
              )}

              {nuevaTarea.imagen && (
                <IonItem>
                  <img 
                    src={nuevaTarea.imagen} 
                    alt="Vista previa" 
                    style={{
                      width: '100%',
                      maxWidth: '300px',
                      margin: '10px auto',
                      borderRadius: '8px'
                    }}
                  />
                </IonItem>
              )}

              <IonButton expand="block" type="submit">
                {modoEdicion ? 'Actualizar' : 'Guardar'}
              </IonButton>
            </form>
          </IonContent>
        </IonModal>

        <IonToast
          isOpen={mostrarToast}
          onDidDismiss={() => setMostrarToast(false)}
          message="Tarea guardada exitosamente"
          duration={2000}
          position="bottom"
          color="success"
        />
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
