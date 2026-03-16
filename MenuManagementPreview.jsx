// =====================================================================
// MenuManagementPreview.jsx
//
// 로컬 미리보기 전용 파일입니다.
// 회사 환경(signlw, CustStyled, axiosUtil)이 없어도 동작합니다.
// 실제 개발은 MenuManagement.jsx 를 사용하세요.
// =====================================================================

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// =====================================================================
// 샘플 데이터 (회사 API 응답과 동일한 대문자 필드 구조)
// 실제 운영에서는 [] 빈 배열로 두고 API에서 가져옵니다.
// =====================================================================
const SAMPLE_DATA = [
  {
    UPPER_FUNC_ID: '0', UPPER_FUNC_NM: 'gscm', LVL_VAL: 1, FUNC_ID: 'R001',
    EN_FUNC_NM: 'Member', KOR_FUNC_NM: '구성원용', SORT_SEQ: 1,
    USE_YN: 'Y', MULTITAB_YN: 'N', SNOP_YN: 'N', FRAME_GBN_CD: '0',
    PROG_ID: '', PROG_NM: '', FSTR_FUNC_ID: '', END_FUNC_ID: '',
    EN_FUNC_NM_SIZE: '', KOR_FUNC_NM_SIZE: '', CHRG_DEPT_CD: '', CHRG_DEPT_NM: '',
    CHRG_USER_ID: '', CHRG_USER_NM: '', URL_PATH_NM: '', STATE: null,
  },
  {
    UPPER_FUNC_ID: 'R001', UPPER_FUNC_NM: '구성원용', LVL_VAL: 2, FUNC_ID: 'BP001',
    EN_FUNC_NM: 'BP', KOR_FUNC_NM: '경영계획', SORT_SEQ: 1,
    USE_YN: 'Y', MULTITAB_YN: 'N', SNOP_YN: 'N', FRAME_GBN_CD: '0',
    PROG_ID: '', PROG_NM: '', FSTR_FUNC_ID: '', END_FUNC_ID: '',
    EN_FUNC_NM_SIZE: '', KOR_FUNC_NM_SIZE: '', CHRG_DEPT_CD: '', CHRG_DEPT_NM: '',
    CHRG_USER_ID: '', CHRG_USER_NM: '', URL_PATH_NM: '', STATE: null,
  },
  {
    UPPER_FUNC_ID: 'BP001', UPPER_FUNC_NM: '경영계획', LVL_VAL: 3, FUNC_ID: 'BP081',
    EN_FUNC_NM: '1.종합현황', KOR_FUNC_NM: '1.종합현황', SORT_SEQ: 1,
    USE_YN: 'Y', MULTITAB_YN: 'N', SNOP_YN: 'N', FRAME_GBN_CD: '0',
    PROG_ID: '', PROG_NM: '', FSTR_FUNC_ID: '', END_FUNC_ID: '',
    EN_FUNC_NM_SIZE: '76', KOR_FUNC_NM_SIZE: '76', CHRG_DEPT_CD: '', CHRG_DEPT_NM: '',
    CHRG_USER_ID: '', CHRG_USER_NM: '', URL_PATH_NM: '', STATE: null,
  },
  {
    UPPER_FUNC_ID: 'BP001', UPPER_FUNC_NM: '경영계획', LVL_VAL: 3, FUNC_ID: 'BP082',
    EN_FUNC_NM: '2.계획운영', KOR_FUNC_NM: '2.계획운영', SORT_SEQ: 2,
    USE_YN: 'Y', MULTITAB_YN: 'N', SNOP_YN: 'N', FRAME_GBN_CD: '0',
    PROG_ID: '', PROG_NM: '', FSTR_FUNC_ID: '', END_FUNC_ID: '',
    EN_FUNC_NM_SIZE: '76', KOR_FUNC_NM_SIZE: '76', CHRG_DEPT_CD: '', CHRG_DEPT_NM: '',
    CHRG_USER_ID: '', CHRG_USER_NM: '', URL_PATH_NM: '', STATE: null,
  },
  {
    UPPER_FUNC_ID: 'BP001', UPPER_FUNC_NM: '경영계획', LVL_VAL: 3, FUNC_ID: 'BP083',
    EN_FUNC_NM: '3.계획분석', KOR_FUNC_NM: '3.계획분석', SORT_SEQ: 3,
    USE_YN: 'Y', MULTITAB_YN: 'N', SNOP_YN: 'N', FRAME_GBN_CD: '0',
    PROG_ID: '', PROG_NM: '', FSTR_FUNC_ID: '', END_FUNC_ID: '',
    EN_FUNC_NM_SIZE: '76', KOR_FUNC_NM_SIZE: '76', CHRG_DEPT_CD: '', CHRG_DEPT_NM: '',
    CHRG_USER_ID: '', CHRG_USER_NM: '', URL_PATH_NM: '', STATE: null,
  },
  {
    UPPER_FUNC_ID: 'BP001', UPPER_FUNC_NM: '경영계획', LVL_VAL: 3, FUNC_ID: 'BP084',
    EN_FUNC_NM: '4.계획조정', KOR_FUNC_NM: '4.계획조정', SORT_SEQ: 4,
    USE_YN: 'Y', MULTITAB_YN: 'N', SNOP_YN: 'N', FRAME_GBN_CD: '0',
    PROG_ID: '', PROG_NM: '', FSTR_FUNC_ID: '', END_FUNC_ID: '',
    EN_FUNC_NM_SIZE: '76', KOR_FUNC_NM_SIZE: '76', CHRG_DEPT_CD: '', CHRG_DEPT_NM: '',
    CHRG_USER_ID: '', CHRG_USER_NM: '', URL_PATH_NM: '', STATE: null,
  },
  {
    UPPER_FUNC_ID: 'BP001', UPPER_FUNC_NM: '경영계획', LVL_VAL: 3, FUNC_ID: 'BP085',
    EN_FUNC_NM: '5.One Number', KOR_FUNC_NM: '5.One Number', SORT_SEQ: 5,
    USE_YN: 'Y', MULTITAB_YN: 'N', SNOP_YN: 'N', FRAME_GBN_CD: '0',
    PROG_ID: '', PROG_NM: '', FSTR_FUNC_ID: '', END_FUNC_ID: '',
    EN_FUNC_NM_SIZE: '76', KOR_FUNC_NM_SIZE: '76', CHRG_DEPT_CD: '', CHRG_DEPT_NM: '',
    CHRG_USER_ID: '', CHRG_USER_NM: '', URL_PATH_NM: '', STATE: null,
  },
  {
    UPPER_FUNC_ID: '0', UPPER_FUNC_NM: 'g', LVL_VAL: 1, FUNC_ID: 'R002',
    EN_FUNC_NM: 'Manager', KOR_FUNC_NM: '경영자용', SORT_SEQ: 2,
    USE_YN: 'Y', MULTITAB_YN: 'N', SNOP_YN: 'N', FRAME_GBN_CD: '0',
    PROG_ID: '', PROG_NM: '', FSTR_FUNC_ID: '', END_FUNC_ID: '',
    EN_FUNC_NM_SIZE: '', KOR_FUNC_NM_SIZE: '', CHRG_DEPT_CD: '', CHRG_DEPT_NM: '',
    CHRG_USER_ID: '', CHRG_USER_NM: '', URL_PATH_NM: '', STATE: null,
  },
  {
    UPPER_FUNC_ID: 'R002', UPPER_FUNC_NM: '경영자용', LVL_VAL: 2, FUNC_ID: 'MG001',
    EN_FUNC_NM: 'Daily Metrics', KOR_FUNC_NM: 'Daily Metrics', SORT_SEQ: 1,
    USE_YN: 'Y', MULTITAB_YN: 'N', SNOP_YN: 'N', FRAME_GBN_CD: '0',
    PROG_ID: '', PROG_NM: '', FSTR_FUNC_ID: '', END_FUNC_ID: '',
    EN_FUNC_NM_SIZE: '', KOR_FUNC_NM_SIZE: '', CHRG_DEPT_CD: '', CHRG_DEPT_NM: '',
    CHRG_USER_ID: '', CHRG_USER_NM: '', URL_PATH_NM: '', STATE: null,
  },
  {
    UPPER_FUNC_ID: 'R002', UPPER_FUNC_NM: '경영자용', LVL_VAL: 2, FUNC_ID: 'MG002',
    EN_FUNC_NM: 'PSI', KOR_FUNC_NM: 'PSI', SORT_SEQ: 2,
    USE_YN: 'Y', MULTITAB_YN: 'N', SNOP_YN: 'N', FRAME_GBN_CD: '0',
    PROG_ID: '', PROG_NM: '', FSTR_FUNC_ID: '', END_FUNC_ID: '',
    EN_FUNC_NM_SIZE: '', KOR_FUNC_NM_SIZE: '', CHRG_DEPT_CD: '', CHRG_DEPT_NM: '',
    CHRG_USER_ID: '', CHRG_USER_NM: '', URL_PATH_NM: '', STATE: null,
  },
  {
    UPPER_FUNC_ID: 'R002', UPPER_FUNC_NM: '경영자용', LVL_VAL: 2, FUNC_ID: 'MG003',
    EN_FUNC_NM: '시장전망', KOR_FUNC_NM: '시장전망', SORT_SEQ: 3,
    USE_YN: 'Y', MULTITAB_YN: 'N', SNOP_YN: 'N', FRAME_GBN_CD: '0',
    PROG_ID: '', PROG_NM: '', FSTR_FUNC_ID: '', END_FUNC_ID: '',
    EN_FUNC_NM_SIZE: '', KOR_FUNC_NM_SIZE: '', CHRG_DEPT_CD: '', CHRG_DEPT_NM: '',
    CHRG_USER_ID: '', CHRG_USER_NM: '', URL_PATH_NM: '', STATE: null,
  },
  {
    UPPER_FUNC_ID: 'MG003', UPPER_FUNC_NM: '시장전망', LVL_VAL: 3, FUNC_ID: 'MG0031',
    EN_FUNC_NM: '2.1 App별 TAM', KOR_FUNC_NM: '2.1 App별 TAM', SORT_SEQ: 1,
    USE_YN: 'Y', MULTITAB_YN: 'N', SNOP_YN: 'N', FRAME_GBN_CD: '0',
    PROG_ID: '', PROG_NM: '', FSTR_FUNC_ID: '', END_FUNC_ID: '',
    EN_FUNC_NM_SIZE: '', KOR_FUNC_NM_SIZE: '', CHRG_DEPT_CD: '', CHRG_DEPT_NM: '',
    CHRG_USER_ID: '', CHRG_USER_NM: '', URL_PATH_NM: '', STATE: null,
  },
  {
    UPPER_FUNC_ID: 'MG003', UPPER_FUNC_NM: '시장전망', LVL_VAL: 3, FUNC_ID: 'MG0032',
    EN_FUNC_NM: '2.2 공급전망', KOR_FUNC_NM: '2.2 공급전망', SORT_SEQ: 2,
    USE_YN: 'Y', MULTITAB_YN: 'N', SNOP_YN: 'N', FRAME_GBN_CD: '0',
    PROG_ID: '', PROG_NM: '', FSTR_FUNC_ID: '', END_FUNC_ID: '',
    EN_FUNC_NM_SIZE: '', KOR_FUNC_NM_SIZE: '', CHRG_DEPT_CD: '', CHRG_DEPT_NM: '',
    CHRG_USER_ID: '', CHRG_USER_NM: '', URL_PATH_NM: '', STATE: null,
  },
  {
    UPPER_FUNC_ID: 'R002', UPPER_FUNC_NM: '경영자용', LVL_VAL: 2, FUNC_ID: 'MG004',
    EN_FUNC_NM: '사업별 손익지표', KOR_FUNC_NM: '사업별 손익지표', SORT_SEQ: 4,
    USE_YN: 'Y', MULTITAB_YN: 'N', SNOP_YN: 'N', FRAME_GBN_CD: '0',
    PROG_ID: '', PROG_NM: '', FSTR_FUNC_ID: '', END_FUNC_ID: '',
    EN_FUNC_NM_SIZE: '', KOR_FUNC_NM_SIZE: '', CHRG_DEPT_CD: '', CHRG_DEPT_NM: '',
    CHRG_USER_ID: '', CHRG_USER_NM: '', URL_PATH_NM: '', STATE: null,
  },
];

// =====================================================================
// 폼 초기값 (MenuManagement.jsx 와 동일 구조)
// =====================================================================
const initialFormData = {
  UPPER_FUNC_ID: '', UPPER_FUNC_NM: '', LVL_VAL: '1', FUNC_ID: '',
  FSTR_FUNC_ID: '', END_FUNC_ID: '', EN_FUNC_NM: '', EN_FUNC_NM_SIZE: '',
  KOR_FUNC_NM: '', KOR_FUNC_NM_SIZE: '', PROG_ID: '', PROG_NM: '',
  SORT_SEQ: '1', USE_YN: 'Y', MULTITAB_YN: 'N', SNOP_YN: 'N',
  CHRG_DEPT_CD: '', CHRG_DEPT_NM: '', CHRG_USER_ID: '', CHRG_USER_NM: '',
  URL_PATH_NM: '', FRAME_GBN_CD: '0', STATE: null,
};

// =====================================================================
// Select 옵션 (MenuManagement.jsx 와 동일)
// =====================================================================
const OPTION_LISTS = {
  USE_YN:       [{ value: 'Y', label: '예' }, { value: 'N', label: '아니오' }],
  MULTITAB_YN:  [{ value: 'Y', label: '예' }, { value: 'N', label: '아니오' }],
  SNOP_YN:      [{ value: 'Y', label: 'Y' }, { value: 'N', label: 'N' }],
  FRAME_GBN_CD: [
    { value: '0', label: 'Nexacro' }, { value: '1', label: 'Birst' },
    { value: '2', label: 'Hyperion' }, { value: '3', label: 'GBW' },
    { value: '4', label: 'Spotfire' }, { value: '5', label: 'Normal' },
  ],
};

// =====================================================================
// flat 배열 → 트리 구조 변환 (MenuManagement.jsx 와 동일 로직)
// =====================================================================
function buildMenuTree(menuItems) {
  if (!menuItems || menuItems.length === 0) return [];

  const itemMap = {};
  menuItems.forEach((item) => {
    itemMap[item.FUNC_ID] = {
      key: item.FUNC_ID,
      title: item.KOR_FUNC_NM || item.EN_FUNC_NM || item.FUNC_ID,
      rawData: { ...item },
      children: [],
    };
  });

  const rootItems = [];
  menuItems.forEach((item) => {
    const currentNode = itemMap[item.FUNC_ID];
    if (item.UPPER_FUNC_ID && itemMap[item.UPPER_FUNC_ID]) {
      itemMap[item.UPPER_FUNC_ID].children.push(currentNode);
    } else {
      rootItems.push(currentNode);
    }
  });

  const sortNodes = (nodes) => {
    nodes.sort((a, b) => (a.rawData?.SORT_SEQ || 0) - (b.rawData?.SORT_SEQ || 0));
    nodes.forEach((n) => n.children.length > 0 && sortNodes(n.children));
  };

  sortNodes(rootItems);
  return rootItems;
}

// =====================================================================
// 메인 컴포넌트
// =====================================================================
const MenuManagementPreview = () => {
  const [menuData]          = useState(() => buildMenuTree(SAMPLE_DATA));
  const [expandedKeys, setExpandedKeys] = useState(new Set());

  // 첫 진입 시 SAMPLE_DATA[0] 을 기본 선택 (API 연동 시에도 동일하게 data[0] 사용)
  const [selectedKey, setSelectedKey]   = useState(SAMPLE_DATA[0]?.FUNC_ID ?? null);
  const [formData, setFormData]         = useState(
    SAMPLE_DATA[0] ? { ...initialFormData, ...SAMPLE_DATA[0] } : initialFormData
  );

  // 상위기능ID 돋보기 모달 state
  const [isModalOpen, setIsModalOpen]           = useState(false);
  const [modalExpandedKeys, setModalExpandedKeys] = useState(new Set());
  const [modalSelectedNode, setModalSelectedNode] = useState(null);

  // 트리 노드 클릭 → 우측 폼 바인딩
  const handleNodeClick = (node) => {
    setSelectedKey(node.key);
    setFormData({ ...initialFormData, ...node.rawData });
  };

  // +/- 토글
  const toggleExpand = (key, e) => {
    e.stopPropagation();
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // 폼 필드 업데이트
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 돋보기 클릭: 상위기능ID 필드는 모달 오픈, 나머지는 console
  const handleSearch = (field) => {
    if (field === 'UPPER_FUNC_ID') {
      setModalSelectedNode(null);
      setIsModalOpen(true);
    } else {
      console.log('돋보기 클릭:', field, formData[field]);
    }
  };

  // 모달 내 트리 토글
  const toggleModalExpand = (key, e) => {
    e.stopPropagation();
    setModalExpandedKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // 모달 내 노드 클릭 → 우측 정보 표시
  const handleModalNodeClick = (node) => {
    setModalSelectedNode(node);
  };

  // 모달 확인: 선택된 노드의 FUNC_ID, KOR_FUNC_NM 을 폼에 바인딩
  const handleModalConfirm = () => {
    if (modalSelectedNode) {
      updateField('UPPER_FUNC_ID', modalSelectedNode.rawData.FUNC_ID);
      updateField('UPPER_FUNC_NM', modalSelectedNode.rawData.KOR_FUNC_NM);
    }
    setIsModalOpen(false);
  };

  // 모달 내 트리 재귀 렌더링
  const renderModalNodes = (nodes, depth = 0) =>
    nodes.map((node) => {
      const hasChildren = node.children.length > 0;
      const isExpanded  = modalExpandedKeys.has(node.key);
      const isSelected  = modalSelectedNode?.key === node.key;
      return (
        <React.Fragment key={node.key}>
          <TreeRow $depth={depth} $isSelected={isSelected} onClick={() => handleModalNodeClick(node)}>
            <TreeToggle onClick={hasChildren ? (e) => toggleModalExpand(node.key, e) : undefined} $hasChildren={hasChildren}>
              {hasChildren ? (isExpanded ? '−' : '+') : '•'}
            </TreeToggle>
            <TreeLabel>{node.title}</TreeLabel>
          </TreeRow>
          {hasChildren && isExpanded && renderModalNodes(node.children, depth + 1)}
        </React.Fragment>
      );
    });

  const handleClear  = (field) => {
    console.log('삭제 클릭:', field);
    updateField(field, '');
    if (field === 'CHRG_DEPT_CD') updateField('CHRG_DEPT_NM', '');
    if (field === 'CHRG_USER_ID') updateField('CHRG_USER_NM', '');
  };

  // 트리 재귀 렌더링
  const renderNodes = (nodes, depth = 0) =>
    nodes.map((node) => {
      const hasChildren = node.children.length > 0;
      const isExpanded  = expandedKeys.has(node.key);
      const isSelected  = selectedKey === node.key;

      return (
        <React.Fragment key={node.key}>
          <TreeRow $depth={depth} $isSelected={isSelected} onClick={() => handleNodeClick(node)}>
            <TreeToggle onClick={hasChildren ? (e) => toggleExpand(node.key, e) : undefined} $hasChildren={hasChildren}>
              {hasChildren ? (isExpanded ? '−' : '+') : '•'}
            </TreeToggle>
            <TreeLabel>{node.title}</TreeLabel>
          </TreeRow>
          {hasChildren && isExpanded && renderNodes(node.children, depth + 1)}
        </React.Fragment>
      );
    });

  return (
    <PageWrapper>
      {/* 헤더 */}
      <Header>
        <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#222' }}>기능그룹</h2>
        <PreviewBadge>로컬 미리보기 전용 — 실제 개발은 MenuManagement.jsx 사용</PreviewBadge>
      </Header>

      <Body>
        {/* 좌측 트리 */}
        <LeftPanel>
          <PanelTitle>메뉴 그룹</PanelTitle>
          <TreeScroll>{renderNodes(menuData)}</TreeScroll>
        </LeftPanel>

        <Divider />

        {/* 우측 폼 */}
        <RightPanel>
          {/* 메뉴 상세 타이틀 */}
          <PanelTitle>메뉴 상세</PanelTitle>
          {/* 저장/삭제 버튼: 타이틀 바로 아래 오른쪽 정렬 */}
          <BtnToolbar>
            <SaveBtn onClick={() => console.log('저장', formData)}>저장</SaveBtn>
            <DelBtn onClick={() => console.log('삭제', formData)}>삭제</DelBtn>
          </BtnToolbar>
          <FormScroll>

            <FormRow>
              <FormLabel>상위기능ID</FormLabel>
              <FieldGroup>
                <Input value={formData.UPPER_FUNC_ID ?? ''} onChange={(e) => updateField('UPPER_FUNC_ID', e.target.value)} />
                <IBtn onClick={() => handleSearch('UPPER_FUNC_ID')}>🔍</IBtn>
                {/* 상위기능명: 텍스트 표시 → 인풋창으로 변경 */}
                <Input value={formData.UPPER_FUNC_NM ?? ''} onChange={(e) => updateField('UPPER_FUNC_NM', e.target.value)} />
              </FieldGroup>
            </FormRow>

            <FormRow>
              <FormLabel>기능ID</FormLabel>
              <FieldGroup>
                <Input value={formData.FUNC_ID ?? ''} onChange={(e) => updateField('FUNC_ID', e.target.value)} />
              </FieldGroup>
            </FormRow>

            <FormRow>
              <FormLabel>기능레벨</FormLabel>
              <FieldGroup>
                <Input type="text" value={formData.LVL_VAL ?? ''} onChange={(e) => updateField('LVL_VAL', e.target.value)} />
              </FieldGroup>
            </FormRow>

            <FormRow>
              <FormLabel>영문기능명</FormLabel>
              <FieldGroup>
                <Input value={formData.EN_FUNC_NM ?? ''} onChange={(e) => updateField('EN_FUNC_NM', e.target.value)} />
                <InlineLabel>메뉴버튼크기</InlineLabel>
                <SmInput type="number" value={formData.EN_FUNC_NM_SIZE ?? ''} onChange={(e) => updateField('EN_FUNC_NM_SIZE', e.target.value)} />
              </FieldGroup>
            </FormRow>

            <FormRow>
              <FormLabel>한글기능명</FormLabel>
              <FieldGroup>
                <Input value={formData.KOR_FUNC_NM ?? ''} onChange={(e) => updateField('KOR_FUNC_NM', e.target.value)} />
              </FieldGroup>
            </FormRow>

            <FormRow>
              <FormLabel>프로그램ID</FormLabel>
              <FieldGroup>
                <Input value={formData.PROG_ID ?? ''} onChange={(e) => updateField('PROG_ID', e.target.value)} />
                <IBtn onClick={() => handleSearch('PROG_ID')}>🔍</IBtn>
                <InlineText>{formData.PROG_NM}</InlineText>
              </FieldGroup>
            </FormRow>

            <FormRow>
              <FormLabel>정렬순서</FormLabel>
              <FieldGroup>
                <Input type="text" value={formData.SORT_SEQ ?? ''} onChange={(e) => updateField('SORT_SEQ', e.target.value)} />
              </FieldGroup>
            </FormRow>

            {/* 사용여부: Y/N 두 값만 있어 라디오 버튼으로 변경 */}
            <FormRow>
              <FormLabel>사용여부</FormLabel>
              <FieldGroup>
                <RadioGroup
                  value={formData.USE_YN}
                  options={OPTION_LISTS.USE_YN}
                  onChange={(val) => updateField('USE_YN', val)}
                />
              </FieldGroup>
            </FormRow>

            {/* 멀티탭여부: Y/N 두 값만 있어 라디오 버튼으로 변경 */}
            <FormRow>
              <FormLabel>멀티탭여부</FormLabel>
              <FieldGroup>
                <RadioGroup
                  value={formData.MULTITAB_YN}
                  options={OPTION_LISTS.MULTITAB_YN}
                  onChange={(val) => updateField('MULTITAB_YN', val)}
                />
              </FieldGroup>
            </FormRow>

            <FormRow>
              <FormLabel>담당부서</FormLabel>
              <FieldGroup>
                <Input value={formData.CHRG_DEPT_CD ?? ''} onChange={(e) => updateField('CHRG_DEPT_CD', e.target.value)} />
                <IBtn onClick={() => handleSearch('CHRG_DEPT_CD')}>🔍</IBtn>
                <IBtn onClick={() => handleClear('CHRG_DEPT_CD')}>✕</IBtn>
              </FieldGroup>
            </FormRow>

            <FormRow>
              <FormLabel>담당자</FormLabel>
              <FieldGroup>
                <Input value={formData.CHRG_USER_ID ?? ''} onChange={(e) => updateField('CHRG_USER_ID', e.target.value)} />
                <IBtn onClick={() => handleSearch('CHRG_USER_ID')}>🔍</IBtn>
                <IBtn onClick={() => handleClear('CHRG_USER_ID')}>✕</IBtn>
              </FieldGroup>
            </FormRow>

            <FormRow>
              <FormLabel>URL PARAM</FormLabel>
              <FieldGroup>
                <Input value={formData.URL_PATH_NM ?? ''} onChange={(e) => updateField('URL_PATH_NM', e.target.value)} />
              </FieldGroup>
            </FormRow>

            {/* S&OP여부 + 프레임타입: 한 행에 나란히 배치 (공간 절약) */}
            <FormRow>
              <FormLabel>S&amp;OP여부</FormLabel>
              <FieldGroup>
                <SelectCombo
                  value={formData.SNOP_YN}
                  options={OPTION_LISTS.SNOP_YN}
                  onChange={(val) => updateField('SNOP_YN', val)}
                />
                <InlineLabel>프레임타입</InlineLabel>
                {/* 옵션 텍스트가 길어서 너비를 넓게 지정 */}
                <SelectCombo
                  value={String(formData.FRAME_GBN_CD)}
                  options={OPTION_LISTS.FRAME_GBN_CD}
                  onChange={(val) => updateField('FRAME_GBN_CD', val)}
                  width="110px"
                />
              </FieldGroup>
            </FormRow>

          </FormScroll>
        </RightPanel>
      </Body>
      {/* ── 상위기능ID 팝업 모달 ──────────────────────── */}
      {isModalOpen && (
        <ModalOverlay onClick={() => setIsModalOpen(false)}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            {/* 모달 헤더 */}
            <ModalHeader>
              <span>상위기능 선택</span>
              <ModalCloseBtn onClick={() => setIsModalOpen(false)}>✕</ModalCloseBtn>
            </ModalHeader>

            <ModalBody>
              {/* 좌측: 메뉴 트리 (메인 트리와 동일) */}
              <ModalLeft>
                <ModalPanelTitle>메뉴 그룹</ModalPanelTitle>
                <ModalTreeScroll>
                  {renderModalNodes(menuData)}
                </ModalTreeScroll>
              </ModalLeft>

              <ModalDivider />

              {/* 우측: 선택된 항목의 FUNC_ID / KOR_FUNC_NM 표시 */}
              <ModalRight>
                <ModalPanelTitle>선택 정보</ModalPanelTitle>
                {modalSelectedNode ? (
                  <ModalInfoTable>
                    <ModalInfoRow>
                      <ModalInfoLabel>기능ID</ModalInfoLabel>
                      <ModalInfoValue>{modalSelectedNode.rawData.FUNC_ID}</ModalInfoValue>
                    </ModalInfoRow>
                    <ModalInfoRow>
                      <ModalInfoLabel>한글기능명</ModalInfoLabel>
                      <ModalInfoValue>{modalSelectedNode.rawData.KOR_FUNC_NM}</ModalInfoValue>
                    </ModalInfoRow>
                  </ModalInfoTable>
                ) : (
                  <ModalPlaceholder>좌측에서 메뉴를 선택하세요</ModalPlaceholder>
                )}
              </ModalRight>
            </ModalBody>

            {/* 모달 푸터: 확인/취소 */}
            <ModalFooter>
              <ModalCancelBtn onClick={() => setIsModalOpen(false)}>취소</ModalCancelBtn>
              <ModalConfirmBtn onClick={handleModalConfirm} disabled={!modalSelectedNode}>확인</ModalConfirmBtn>
            </ModalFooter>
          </ModalBox>
        </ModalOverlay>
      )}
    </PageWrapper>
  );
};

export default MenuManagementPreview;

// =====================================================================
// styled-components
// =====================================================================
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f4f6f9;
  font-family: 'Malgun Gothic', -apple-system, system-ui, sans-serif;
  font-size: 12px;
  box-sizing: border-box;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: linear-gradient(#f5f7fa, #e8ecf2);
  border-bottom: 1px solid #c4ccd7;
`;

const PreviewBadge = styled.span`
  font-size: 10px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  color: #856404;
  border-radius: 3px;
  padding: 2px 6px;
`;

const Body = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
  padding: 10px;
  gap: 0;
`;

const LeftPanel = styled.div`
  width: 280px;
  flex-shrink: 0;
  background: #fff;
  border: 1px solid #c4ccd7;
  border-radius: 2px;
  display: flex;
  flex-direction: column;
`;

const Divider = styled.div`
  width: 10px;
`;

const RightPanel = styled.div`
  flex: 1;
  background: #fff;
  border: 1px solid #c4ccd7;
  border-radius: 2px;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const PanelTitle = styled.div`
  padding: 6px 10px;
  background: linear-gradient(#f5f7fa, #e8ecf2);
  border-bottom: 1px solid #c4ccd7;
  font-size: 12px;
  font-weight: 600;
  color: #333;
  flex-shrink: 0;
`;

/* 저장/삭제 버튼 행: 타이틀 바로 아래, 오른쪽 정렬 */
const BtnToolbar = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border-bottom: 1px solid #e8ecf2;
  background: #fafbfd;
  flex-shrink: 0;
`;

const TreeScroll = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 4px;
`;

const TreeRow = styled.div`
  display: flex;
  align-items: center;
  padding: 3px 6px 3px ${(p) => 6 + p.$depth * 14}px;
  cursor: pointer;
  border-radius: 2px;
  background: ${(p) => (p.$isSelected ? '#e2f0ff' : 'transparent')};
  color: ${(p) => (p.$isSelected ? '#003c80' : '#333')};
  &:hover { background: ${(p) => (p.$isSelected ? '#d6e8ff' : '#f1f4f8')}; }
`;

const TreeToggle = styled.span`
  width: 16px;
  text-align: center;
  flex-shrink: 0;
  color: ${(p) => (p.$hasChildren ? '#4c77bf' : '#aaa')};
  font-weight: ${(p) => (p.$hasChildren ? 700 : 400)};
`;

const TreeLabel = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FormScroll = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px 14px;
`;

// 레이블(100px) + 입력영역(나머지) 2단 그리드
const FormRow = styled.div`
  display: grid;
  grid-template-columns: 100px 1fr;
  align-items: center;
  gap: 6px;
  margin-bottom: 7px;
`;

const FormLabel = styled.div`
  font-size: 11px;
  color: #555;
`;

const FieldGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
`;

const baseInput = `
  height: 22px;
  padding: 0 6px;
  border: 1px solid #c4ccd7;
  border-radius: 2px;
  font-size: 11px;
  color: #222;
  background: #fff;
  box-sizing: border-box;
  outline: none;
  &:focus { border-color: #5b8def; box-shadow: 0 0 0 1px rgba(91,141,239,.2); }
`;

// 일반 텍스트 입력 (최대 160px로 제한 - 이전 대비 절반)
const Input = styled.input`
  ${baseInput}
  max-width: 160px;
  flex: 1;
`;

// 숫자 입력 (버튼크기 등 짧은 값 전용 - 이전 70px → 36px)
const SmInput = styled.input`
  ${baseInput}
  width: 36px;
  flex: 0 0 36px;
  text-align: right;
`;

// 기본 셀렉트 (이전 150px → 75px)
const StyledSelect = styled.select`
  ${baseInput}
  width: 75px;
  flex: 0 0 75px;
`;

// 라디오 그룹 컴포넌트 (사용여부, 멀티탭여부 등 Y/N 선택)
const RadioGroup = ({ value, options, onChange }) => (
  <RadioGroupWrap>
    {options.map((o) => (
      <RadioItem key={o.value} onClick={() => onChange(o.value)}>
        <RadioCircle checked={value === o.value} />
        <RadioLabel>{o.label}</RadioLabel>
      </RadioItem>
    ))}
  </RadioGroupWrap>
);

const RadioGroupWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const RadioItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  user-select: none;
`;

const RadioCircle = styled.div`
  width: 13px;
  height: 13px;
  border-radius: 50%;
  border: 1px solid ${(p) => (p.checked ? '#4c77bf' : '#b0b8c4')};
  background: ${(p) => (p.checked ? '#fff' : '#fff')};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &::after {
    content: '';
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: ${(p) => (p.checked ? '#4c77bf' : 'transparent')};
  }
`;

const RadioLabel = styled.span`
  font-size: 11px;
  color: #333;
`;

// 기업형 셀렉트콤보 wrapper
// 셀렉트콤보 wrapper (이전 140px → 70px)
// width prop으로 너비 조절 가능 (기본 70px, 프레임타입처럼 옵션이 긴 경우 늘려 사용)
const ComboWrap = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  width: ${({ $width }) => $width || '70px'};
  flex: 0 0 ${({ $width }) => $width || '70px'};
`;

const ComboSelect = styled.select`
  ${baseInput}
  width: 100%;
  padding-right: 22px;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  background: #fff;
`;

const ComboArrow = styled.span`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(#f5f7fa, #e8ecf2);
  border-left: 1px solid #c4ccd7;
  border-radius: 0 2px 2px 0;
  font-size: 9px;
  color: #555;
  pointer-events: none;
`;

// 셀렉트콤보 컴포넌트 (width prop으로 개별 너비 지정 가능)
const SelectCombo = ({ value, options, onChange, width }) => (
  <ComboWrap $width={width}>
    <ComboSelect value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </ComboSelect>
    <ComboArrow>▼</ComboArrow>
  </ComboWrap>
);

const IBtn = styled.button`
  width: 22px; height: 22px;
  padding: 0;
  border: 1px solid #c4ccd7;
  border-radius: 2px;
  background: #f6f7fb;
  cursor: pointer;
  font-size: 11px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  &:hover { background: #e8edf7; }
  &:active { background: #d7e1f5; }
`;

const InlineText = styled.span`
  font-size: 11px;
  color: #333;
  margin-left: 3px;
`;

const InlineLabel = styled.span`
  font-size: 11px;
  color: #555;
  margin: 0 3px 0 8px;
  white-space: nowrap;
`;

const BtnRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 14px;
`;

const BaseBtn = styled.button`
  min-width: 68px; height: 24px;
  border-radius: 2px; font-size: 11px; cursor: pointer;
  border: 1px solid #a5b3c6;
`;

const SaveBtn = styled(BaseBtn)`
  background: linear-gradient(#4c77bf, #395f9b);
  border-color: #294579; color: #fff;
  &:hover { background: linear-gradient(#577fca, #3e65a4); }
`;

const DelBtn = styled(BaseBtn)`
  background: linear-gradient(#f8f9fc, #e5e8f1);
  color: #333;
  &:hover { background: linear-gradient(#fff, #e9edf7); }
`;

// ── 상위기능ID 모달 스타일 ────────────────────────────────────
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalBox = styled.div`
  background: #fff;
  border: 1px solid #8a9bbf;
  border-radius: 4px;
  width: 640px;
  max-height: 520px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 6px 24px rgba(0,0,0,0.22);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 12px;
  background: linear-gradient(#4c77bf, #395f9b);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  border-radius: 3px 3px 0 0;
  flex-shrink: 0;
`;

const ModalCloseBtn = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  padding: 0 2px;
  line-height: 1;
  &:hover { opacity: 0.75; }
`;

const ModalBody = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const ModalLeft = styled.div`
  width: 52%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #d0d8e8;
`;

const ModalRight = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ModalDivider = styled.div`
  width: 1px;
  background: #d0d8e8;
  flex-shrink: 0;
`;

const ModalPanelTitle = styled.div`
  padding: 5px 10px;
  background: linear-gradient(#f5f7fa, #e8ecf2);
  border-bottom: 1px solid #c4ccd7;
  font-size: 11px;
  font-weight: 600;
  color: #444;
  flex-shrink: 0;
`;

const ModalTreeScroll = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
`;

const ModalInfoTable = styled.div`
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ModalInfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ModalInfoLabel = styled.span`
  font-size: 11px;
  color: #666;
  width: 72px;
  flex-shrink: 0;
  font-weight: 600;
`;

const ModalInfoValue = styled.span`
  font-size: 12px;
  color: #1a3a6e;
  font-weight: 600;
  padding: 3px 8px;
  background: #eef2fa;
  border: 1px solid #c4ccd7;
  border-radius: 2px;
  min-width: 80px;
`;

const ModalPlaceholder = styled.div`
  padding: 20px 14px;
  font-size: 11px;
  color: #aaa;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  padding: 8px 12px;
  border-top: 1px solid #d0d8e8;
  background: #f7f9fc;
  flex-shrink: 0;
`;

const ModalConfirmBtn = styled(BaseBtn)`
  background: linear-gradient(#4c77bf, #395f9b);
  border-color: #294579;
  color: #fff;
  &:hover { background: linear-gradient(#577fca, #3e65a4); }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
`;

const ModalCancelBtn = styled(BaseBtn)`
  background: linear-gradient(#f8f9fc, #e5e8f1);
  color: #333;
  &:hover { background: linear-gradient(#fff, #e9edf7); }
`;
