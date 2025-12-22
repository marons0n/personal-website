import { useState } from 'react';
import './LehighCourses.css';

interface Course {
    id: string;
    title: string;
    description: string;
}

const COURSES: Course[] = [
    {
        id: 'cse340',
        title: 'Design and Analysis of Algorithms',
        description: 'Learned and applied core concepts surrounding algorithm design, including sorting, searching, graphing algorithms, and dynamic programming. Focused on analysis and real world implications of time/space complexity. Developed strong proof writing skills.'
    },
    {
        id: 'cse216',
        title: 'Software Engineering',
        description: 'A project oriented course designed around building a full stack social media platform called "The Buzz" (See GitHub). Learned and employed Agile developement with a team of 5, building out Web (React) and Mobile (Flutter)frontends, a backend (Java) and admin console. This course strengthened my communciation and collaboration skills greatly. '
    },
    {
        id: 'cse303',
        title: 'Operating System Design',
        description: 'Learned how operating systems manage core  responsibilities: concurrency, security, memory, persistence, and resource allocation. Through hands-on programming assignments in C/C++, I gained experience interacting directly with the OS by implementing threads, synchronization mechanisms, memory management techniques, and file system concepts. The course strengthened my understanding of how abstraction and virtualization enable efficient and secure system design, both in operating systems and general software.'
    },
    {
        id: 'cse262',
        title: 'Programming Languages',
        description: 'Exploration of the design and implementation of programming languages, covering syntax, semantics, type systems, and various paradigms.'
    },
    {
        id: 'cse202',
        title: 'Computer Architecture',
        description:  'Extremely technical course that utilized low level programming(C) and machine code to explore the various mechanisms of a computer, including phyiscal/virtual memory, persistent storage, the CPU, IO, and the cache hierarchy. '
    },
    {
        id: 'cse341',
        title: 'AI Game Design',
        description: 'I gained hands-on experience implementing core game AI techniques such as pathfinding, tactics, and adaptive behaviors within existing game engines and codebases. The course deepened my understanding of how AI systems shape player experience, narrative, and aesthetics, emphasizing practical, industry-focused design over purely theoretical AI. I also learned to evaluate and compare game AI approaches with those used in academic research and non-game domains, strengthening my ability to apply AI tools effectively in interactive systems.'
    },
    {
        id: 'cse264',
        title: 'Web Systems Design',
        description: 'Developed full stack web applications with a focus on Javascript. Used Express.js to create backends in tandem with PostgresSQL databases. Utilized React to create dynamic frontends with an emphasis on readable and maintainable code.'
    },
    {
        id: 'calc123',
        title: 'Calculus I, II, and III',
        description: 'Developed a strong foundation in differential, integral, and multivariable calculus. I learned to model and analyze continuous systems using limits, derivatives, integrals, and infinite series. The sequence strengthened my ability to reason about functions of several variables, including partial derivatives, multiple integrals, and vector calculus. These courses built the mathematical intuition needed for advanced work in engineering, physics, and computer science.'
    },

    {
        id: 'math205',
        title: 'Linear Methods',
        description: 'Study of vector spaces, linear transformations, matrices, determinants, and systems of linear equations with applications.'
    }
];

interface LehighCoursesProps {
    visible: boolean;
    containerRef: React.RefObject<HTMLDivElement | null>;
}

export default function LehighCourses({ visible, containerRef }: LehighCoursesProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    if (!visible) return null;

    const selectedCourse = COURSES.find(c => c.id === selectedId);

    return (
        <div className="lehigh-courses-container" ref={containerRef}>
            <div className="courses-list">
                <h2>Relevant Coursework at Lehigh University</h2>
                <ul>
                    {COURSES.map((course) => (
                        <li
                            key={course.id}
                            onClick={() => setSelectedId(course.id)}
                            className={selectedId === course.id ? 'selected' : ''}
                        >

                            <span className="course-title">{course.title}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="course-details">
                {selectedCourse ? (
                    <div key={selectedCourse.id} className="details-content fade-in">
                        <h3>{selectedCourse.title}</h3>
                        <p>{selectedCourse.description}</p>
                    </div>
                ) : (
                    <div className="details-placeholder">
                        <p>Select a course to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
}
