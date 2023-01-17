import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { calendarApi } from '../api';
import { convertEventToDateEvents } from '../helpers';
import { onAddNewEvent, onDeleteEvent, onLoadingEvents, onSetActiveEvent, onUpdateEvent } from '../store';


export const useCalendarStore = () => {
  
    const dispatch = useDispatch();
    const { events, activeEvent } = useSelector( state => state.calendar );
    const { user } = useSelector( state => state.auth );
    
    const setActiveEvent = ( calendarEvent ) => {
        dispatch( onSetActiveEvent( calendarEvent ) )
    }

    const startSavingEvent = async( calendarEvent ) => {

        try 
        {
            if( calendarEvent.id ) {
                // Updating
                await calendarApi.put(`/events/${ calendarEvent.id }`, calendarEvent );
    
                dispatch( onUpdateEvent({ ...calendarEvent, user }) );
                return;
            } 
            // Creating
            const { data } = await calendarApi.post( '/events/new', calendarEvent );
    
            dispatch( onAddNewEvent({ ...calendarEvent, id: data.event.id, user }) );
        } 
        catch (error) 
        {
            console.log(error);
            Swal.fire( 'Error', error.response.data?.msg, 'error' );
        }
        
    }

    const startDeletingEvent = async () => {

        try 
        {
            await calendarApi.delete(`/events/${ activeEvent.id }`);

            dispatch( onDeleteEvent() );
        } 
        catch (error) 
        {
            Swal.fire( 'Error', error.response.data?.msg, 'error' );
            console.log( error );
        }
        
    }

    const startLoadingEvents = async ()=>
    {
        try 
        {
            const { data } = await calendarApi.get( '/events' );
            const events = convertEventToDateEvents( data.events );

            dispatch( onLoadingEvents( events ) );
        }
        catch (error) 
        {
            console.log( 'Error: failed to load events' );
            console.log( error );
        }
    }


    return {

        // Props
        activeEvent,
        events,
        hasEventSelected: !!activeEvent,

        // Methods
        setActiveEvent,
        startDeletingEvent,
        startLoadingEvents,
        startSavingEvent,
    }
}
