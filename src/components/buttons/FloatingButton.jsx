/*
 * Copyright Intern MSIB6 @ PT Len Industri (Persero)
 *
 * THIS SOFTWARE SOURCE CODE AND ANY EXECUTABLE DERIVED THEREOF ARE PROPRIETARY
 * TO PT LEN INDUSTRI (PERSERO), AS APPLICABLE, AND SHALL NOT BE USED IN ANY WAY
 * OTHER THAN BEFOREHAND AGREED ON BY PT LEN INDUSTRI (PERSERO), NOR BE REPRODUCED
 * OR DISCLOSED TO THIRD PARTIES WITHOUT PRIOR WRITTEN AUTHORIZATION BY
 * PT LEN INDUSTRI (PERSERO), AS APPLICABLE.
 *
 * Created Date: Sunday, March 24nd 2024, 10:46:45 am
 * Author: Febrina Qoonitah | febrina231@gmail.com <https://github.com/febrinaqh>
 *
 */

export const FloatingButton = ({ children, onClick }) => {
  return (
    <div onClick={onClick} className=" mr-3 ">
      <button className="p-2 bg-slate-800 text-white rounded-md mb-2">
        {children}
      </button>
    </div>
  );
};
