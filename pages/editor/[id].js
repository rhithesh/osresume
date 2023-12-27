import { RedirectToSignIn, SignedIn, SignedOut, useAuth } from '@clerk/nextjs';
import { useMediaQuery } from '@material-ui/core';
import axios from 'axios';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useShallow } from 'zustand/react/shallow';
import LeftSideBar from '../../components/LeftSideBar';
import Loader from '../../components/Loader';
import RightSideBar from '../../components/RightSideBar';
import { ResumeNotFoundSVG } from '../../components/SVGs';
import Onyx from '../../components/templates/Onyx';
import Trical from '../../components/templates/Trical';

import addFontInHeadTag from '../../shared/utils/addFontInHeadTag';
import { useResumeStore } from '../../zustand/zustand';

const Editor = () => {
  const { getToken } = useAuth();
  const router = useRouter();
  const desktop = useMediaQuery('(min-width:1024px)');
  const {} = useResumeStore(state => state.data);

  const resumeRef = useRef();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { title, username, personaldata, eductainvalues, experiencedata, extrasdata, resumeMeta } = useResumeStore(
    useShallow(state => ({
      title: state.data.resumeMeta.title,
      username: state.data.personal.username,
      personaldata: state.data.personal,
      eductainvalues: state.data.education,
      experiencedata: state.data.experience,
      extrasdata: state.data.extras,
      resumeMeta: state.data.resumeMeta,
    })),
  );

  const addexperiencedata = useResumeStore(state => state.addExperience);
  const addextradata = useResumeStore(state => state.addExtras);
  const addpersonaldata = useResumeStore(state => state.addPersonal);
  const addeducationdata = useResumeStore(state => state.addEducation);
  const addmetadata = useResumeStore(state => state.addResumemeta);

  const handlePrint = useReactToPrint({
    documentTitle: title || 'Your Resume',
    content: () => resumeRef.current,
    /* eslint-disable no-tabs */
    pageStyle: `
			@page {
				margin: 0;
				padding: 0;
				overflow: hidden;
				height: 0; 
			}
			@media print {
				footer {display: none;}
				header {display: none;}
				html,body {
					overflow: hidden;
					border: 1px solid white;
					height: 100%;
					page-break-after: avoid;
					page-break-before: avoid;
					margin:0;
					padding:0;
					font-size: 100%;
				}
			}
			`,
  });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const { data } = await axios({
          url: `/api/resumes/${router.query.id}`,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // console.log(data);
        const personalData = data.resume.personal
          ? data.resume.personal
          : { name: '', email: '', phoneNumber: '', designation: '', country: '', objective: '' };
        addmetadata({
          title: data.resume.title,
          createdAt: data.resume.createdAt,
          resumeId: data.resume._id,
          userId: data.resume.userId,
          templateName: data.resume.templateName,
          customStyles: data.resume.customStyles,
        });
        addeducationdata(data.resume.education);
        addexperiencedata(data.resume.experience);
        addpersonaldata(personalData);
        addextradata(data.resume.extras);

        const fontID = data.resume.customStyles.font.replace(/ /g, '+');
        addFontInHeadTag(fontID);
      } catch (error) {
        // console.log(error);
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [router.query.id]);

  const render = () => {
    if (loading) {
      return <Loader fullScreen />;
    }
    if (error) {
      return (
        <div className="p-10 flex flex-col items-center justify-center" style={{ height: '90vh' }}>
          <ResumeNotFoundSVG width="50%" />
          <h5 className="text-default mt-6 font-normal text-xl">
            The Resume you are looking for is <span className="bg-primary text-white"> no longer available </span> or you
            <span className="bg-primary text-white"> don&apos;t have the permission </span>to view it.
          </h5>
        </div>
      );
    }
    if (desktop) {
      return (
        <div className="flex flex-col lg:flex-row bg-gray-50">
          <LeftSideBar />
          <div className="order-2 mx-auto my-10">
            {resumeMeta.templateName === 'Onyx' && <Onyx data={{}} ref={resumeRef} customStyles={alll.resumeMeta.customStyles} />}
            {resumeMeta.templateName === 'Trical' && (
              <Trical
                ref={resumeRef}
                extrasdata={extrasdata}
                perosnaldata={personaldata}
                educationdata={eductainvalues}
                customStyles={resumeMeta.customStyles}
                experiencedata={experiencedata}
              />
            )}
          </div>
          <RightSideBar handlePrint={handlePrint} />
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '91vh' }}>
        Please switch to desktop for better experience.
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>{username ? `${username} | OS Resume` : 'Resume Editor | OS Resume'}</title>
      </Head>
      <SignedIn>{render()}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

export default Editor;
