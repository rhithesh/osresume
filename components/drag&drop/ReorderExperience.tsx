import { useAuth } from '@clerk/nextjs';
import { Drawer, makeStyles, useMediaQuery } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import SaveIcon from '@material-ui/icons/Save';
import axios from 'axios';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { DragDropContext, Draggable, DropResult, Droppable } from 'react-beautiful-dnd';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { useShallow } from 'zustand/react/shallow';
import { toastMessages } from '../../shared/contants';
import { useResumeStore } from '../../zustand/zustand';
import { EmptyFileSVG } from '../SVGs';
import ExperienceCard from '../cards/ExperienceCard';
import EditSingleExperience from '../forms/EditSingleExperience';

interface ReorderExperience {
  closeDrawer: (anchor: string, type: boolean) => void;
  anchor: string;
}
company: 'Company Description';
country: 'Sample Country';
description: 'Sample Description';
designation: 'Sample Designation';
endedAt: 'July 2013';
id: 'c5d68371-34a2-4e51-817e-94e7edb1342b';
startedAt: 'June 2012';
years: '1';

interface Experience {
  company: string;
  country: string;
  description: string;
  designation: string;
  endedAt: string;
  id: string;
  startedAt: string;
  years: string;
}

const ReorderExperience = ({ closeDrawer, anchor }: ReorderExperience) => {
  const showSnack = (message: string, variant: string) => {
    if (variant === 'success') {
      toast.success(message);
    } else if (variant === 'error') {
      toast.error(message);
    } else if (variant === 'default') {
      toast.message(message);
    } else if (variant === 'info') {
      toast.info(message);
    }
  };

  const { getToken } = useAuth();

  const { resumeId } = useResumeStore(useShallow(state => state.data.resumeMeta));

  // media Query
  const matches = useMediaQuery('(min-width:1024px)');

  // Fetch Global State
  const experiences = useResumeStore(useShallow(state => state.data.experience));

  const addExperiencedata = useResumeStore(state => state.addExperience);
  const addSampleExperience = useResumeStore(state => state.addSampleExperience);
  const deleteSingleExperience = useResumeStore(state => state.deleteSingleExperience);

  // Local Experiences State for drag and drop
  const [exp, setExp] = useState<Experience[]>(experiences);

  //ask vishwajeet
  const experienceStates: Record<string, boolean> = {};
  exp.forEach(exp => (experienceStates[exp.id] = false));
  //
  console.log(experienceStates, 'these are experience states');
  const [experienceActive, setExperienceActive] = useState<Record<string, boolean>>({ ...experienceStates });

  // This to keep track of localState if one of the experiences have been updated to update state in useEffect
  const [edit, setEdit] = useState(false);

  const expDrawerStatesObj: Record<string, boolean> = {};
  exp.map(exp => (expDrawerStatesObj[exp.id] = false));

  useEffect(() => {
    if (!(experiences.length === exp.length)) {
      setExp(experiences);
    }
    if (edit) {
      setExp(experiences);
      setEdit(false);
    }
  }, [experiences, exp, edit]);

  const useStyles = makeStyles({
    list: {
      width: matches ? '50vw' : '100vw',
      // width: '50vw',
      minHeight: matches ? '0' : '100vh',
    },
    fullList: {
      width: 'auto',
    },
  });
  const classes = useStyles();

  // Nested Drawer States
  const [expDrawerStates, setExpDrawerStates] = React.useState({ ...expDrawerStatesObj });
  const toggleExpDrawerStates = (id: string, open: boolean) => () => {
    setExpDrawerStates({ ...expDrawerStates, [id]: open });
  };
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(exp);

    const [reorderItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderItem);
    console.log(items);
    setExp(items);
  };

  const grid = 10;
  const getItemStyle = (isDragging: boolean, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',
    padding: grid * 2,
    margin: `0 0 ${grid}px 0`,
    transition: 'height 0.2s',
    overflow: 'hidden',

    // change background colour if dragging
    background: isDragging ? '#1abc9c95' : '#1abc9c',

    // styles we need to apply on draggables
    ...draggableStyle,
  });

  const getListStyle = isDraggingOver => ({
    // background: isDraggingOver ? '#ffffff' : '#16a085',
  });

  const disableActiveExp = () => {
    const clone = Object.create(experienceActive);

    const ids = Object.keys(clone);

    // create an object that will be passed as in state
    // which we will use to disable the rest state (false)
    // this will ensure at one time only one is active
    const fakeState: Record<string, boolean> = {};

    // assign each state false
    ids.forEach(id => {
      fakeState[id] = false;
    });

    // setActive only the one that gets clicked
    setExperienceActive(fakeState);
  };

  const onClickExp = ({ id }: { id: string }) => {
    // CLone the activeExperiences State
    const clone = Object.create(experienceActive);

    // check if the clicked experience is already active then disable it and return
    if (clone[id]) {
      setExperienceActive(p => ({
        ...p,
        [id]: false,
      }));
      return;
    }

    // Get All Ids from state in an Array
    const ids = Object.keys(clone);

    // create an object that will be passed as in state
    // which we will use to disable the rest state (false)
    // this will ensure at one time only one is active
    const fakeState: Record<string, boolean> = {};

    // assign each state false
    ids.forEach(id => {
      fakeState[id] = false;
    });

    // setActive only the one that gets clicked
    setExperienceActive(p => ({
      ...ids,
      [id]: true,
    }));
  };

  const onDelete = async ({ id }: { id: string }) => {
    if (id.includes('-')) {
      deleteSingleExperience(id);
      return;
    }
    try {
      showSnack(toastMessages.DELETE_RESOURCE_REQUEST('Experience'), 'default');
      const token = await getToken();
      await axios({
        url: `/api/experiences/${id}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      deleteSingleExperience(id);
      showSnack(toastMessages.DELETE_RESOURCE_SUCCESS('Experience'), 'success');
    } catch (error) {
      showSnack(toastMessages.DELETE_RESOURCE_ERROR('Experience'), 'error');
    }
  };

  const save = async () => {
    let flag = false;
    exp.forEach(e => {
      if (e.id.includes('-')) {
        flag = true;
      }
    });
    if (flag) {
      showSnack(toastMessages.WARN_BEFORE_SAVE('Experience'), 'info');
      return;
    }
    try {
      showSnack(toastMessages.SAVE_ORDER_RESOURCE_REQUEST('Experience'), 'default');
      const token = await getToken();
      const { data } = await axios({
        url: `/api/resumes/${resumeId}`,
        method: 'PATCH',
        data: {
          experience: exp,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      addExperiencedata(data.resume.experience);
      // dispatch(addExperienceData(data.resume.experience));
      showSnack(toastMessages.SAVE_ORDER_RESOURCE_SUCCESS('Experience'), 'success');
      closeDrawer(anchor, false);
    } catch (error) {
      showSnack(toastMessages.SAVE_ORDER_RESOURCE_ERROR('Experience'), 'error');
    }
  };

  const onAdd = () => {
    addSampleExperience({
      id: uuidv4(),
      designation: 'Sample Designation',
      company: 'Company Description',
      description: 'Sample Description',
      startedAt: 'June 2012',
      endedAt: 'July 2013',
      years: '1',
      country: 'Sample Country',
    });

    showSnack(toastMessages.SAMPLE_DATA('Experience'), 'success');
  };

  return (
    <>
      <div className="flex items-center justify-start flex-wrap lg:flex-nowrap">
        <div className="w-full md:w-auto mb-4 md:mb-0">
          <Button className="lg:px-4 lg:py-2 mr-4" onClick={() => closeDrawer(anchor, false)} color="default" variant="text">
            {' '}
            <ArrowBackIcon />
            <p className="ml-2 capitalize">Back</p>
          </Button>
        </div>
        <Button className="lg:px-4 lg:py-2 mr-4" onClick={onAdd} color="primary" variant="outlined">
          <AddIcon />
          <p className="ml-2 capitalize">Add Experience</p>
        </Button>
        <Button className="lg:px-4 lg:py-2  text-white hover:bg-[#12836d]  bg-primary" onClick={save} color="primary" variant="contained">
          <SaveIcon />
          <p className="ml-2 capitalize mr-6   ">Save Order</p>
        </Button>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="experiences">
          {(provided, snapshot) => (
            // eslint-disable-next-line
            <div
              style={getListStyle(snapshot.isDraggingOver)}
              className="pb-10 pt-8 rounded flex-1 flex flex-col"
              {...provided.droppableProps}
              ref={provided.innerRef}
              onClick={() => {
                if (snapshot.isDraggingOver) {
                  disableActiveExp();
                }
              }}
            >
              {exp.length === 0 ? (
                <div className="flex items-center justify-center flex-1">
                  <div className="bg-gray-50 rounded-full h-96 w-96 flex flex-col items-center justify-center">
                    <EmptyFileSVG />
                    <h5 className="text-default font-normal my-5">No Experience Yet!</h5>
                  </div>
                </div>
              ) : (
                exp.map((e, index) => (
                  <Draggable key={e.id} draggableId={e.id} index={index}>
                    {(provided, snapshot) => (
                      // eslint-disable-next-line
                      <div
                        onClick={() => onClickExp({ id: e.id })}
                        className="p-6 text-white text-lg bg-primary rounded"
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        ref={provided.innerRef}
                        style={{ ...getItemStyle(snapshot.isDragging, provided.draggableProps.style) }}
                      >
                        <ExperienceCard
                          {...e}
                          onDelete={onDelete}
                          openEditExpForm={toggleExpDrawerStates(e.id, true)}
                          experienceActive={experienceActive}
                        />
                      </div>
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {exp.map(exp => (
        <div key={exp.id}>
          <Drawer anchor="left" open={expDrawerStates[exp.id]} onClose={toggleExpDrawerStates(exp.id, false)}>
            <div className={clsx(classes.list)} role="presentation">
              <div className="pt-10 pl-10">
                <div className="flex align-center">
                  <Button className="px-4 py-2" onClick={toggleExpDrawerStates(exp.id, false)} color="default" variant="outlined">
                    <ArrowBackIcon />
                    <p className="ml-2 capitalize">Back</p>
                  </Button>
                </div>
                <EditSingleExperience
                  anchor={anchor}
                  experience={exp}
                  setEdit={setEdit}
                  closeDrawer={toggleExpDrawerStates(exp.id, false)}
                />
              </div>
              {/* <Divider /> */}
            </div>
          </Drawer>
        </div>
      ))}
    </>
  );
};

export default ReorderExperience;
