// =====================================================================
// MenuManagement.jsx
// 기능그룹(메뉴) 관리 페이지
//
// [사용 라이브러리]
//  - signlw      : 회사 공통 UI 컴포넌트 (Menu, Select, TextField, Button, Row, Col ...)
//  - CustStyled  : 회사 공통 레이아웃 컴포넌트
//  - axiosUtil   : 회사 공통 HTTP 클라이언트
//  - useLoading  : 전역 로딩 스피너 컨텍스트
//
// [구조 요약]
//  ┌─────────────────────────────────────────────────┐
//  │  HeaderMenuContainer  (페이지 타이틀)             │
//  ├──────────────┬──────────────────────────────────┤
//  │  MenuPanel   │  상세 폼 (FormContainer)          │
//  │  (좌측 트리) │  - 각 항목이 formData 에 바인딩   │
//  └──────────────┴──────────────────────────────────┘
//
// [데이터 흐름]
//  1. 마운트 시 fnInit() -> fnGetMenuData() -> axiosUtil.post(API)
//  2. 응답 flat 리스트를 buildMenuTree() 로 트리 변환 -> menuData state 저장
//  3. 트리 노드 클릭 -> handleMenuSelect() -> formData state 갱신 -> 우측 폼 바인딩
// =====================================================================

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// 회사 공통 HTTP 클라이언트
import axiosUtil from '../../components/AxiosUtil';

// 전역 로딩 스피너
import { useLoading } from '../../containers/LoadingContext';

// 회사 공통 UI 컴포넌트
// signlw 에서 필요한 컴포넌트만 가져옵니다.
// Modal, Radio, Table 은 현재 화면에서는 미사용이지만 이후 확장을 위해 import 유지
import {
  Button,
  Col,
  Divider,
  Menu,
  Modal,
  Radio,
  Row,
  Select,
  Table,
  TextField,
} from 'signlw';

// 회사 공통 레이아웃 styled-components
import {
  GlobalStyle,
  HeaderMenuContainer,
  MenuPanelWrap,
  FlexContainer,
  Container,
  ContentContainer,
  PageTitleArea,
} from '../../components/CustStyled';


// =====================================================================
// 1. 폼 초기값 (우측 상세 폼 기본 상태)
// =====================================================================
// - API 연동 전에는 이 값으로 폼이 렌더링됩니다.
// - 트리에서 노드를 클릭하면 해당 노드의 데이터로 덮어씌워집니다.
// - 필드명은 백엔드 API 컬럼명(대문자)과 동일하게 맞췄습니다.
const initialFormData = {
  UPPER_FUNC_ID: '',    // 상위기능ID
  UPPER_FUNC_NM: '',    // 상위기능명
  LVL_VAL: '1',        // 기능레벨
  FUNC_ID: '',          // 기능ID
  FSTR_FUNC_ID: '',     // 시작기능ID
  END_FUNC_ID: '',      // 종료기능ID
  EN_FUNC_NM: '',       // 영문기능명
  EN_FUNC_NM_SIZE: '',  // 영문기능명 버튼 크기
  KOR_FUNC_NM: '',      // 한글기능명
  KOR_FUNC_NM_SIZE: '', // 한글기능명 버튼 크기
  PROG_ID: '',          // 프로그램ID
  PROG_NM: '',          // 프로그램명
  SORT_SEQ: '1',        // 정렬순서
  USE_YN: 'Y',          // 사용여부
  MULTITAB_YN: 'N',     // 멀티탭여부
  SNOP_YN: 'N',         // S&OP여부
  CHRG_DEPT_CD: '',     // 담당부서코드
  CHRG_DEPT_NM: '',     // 담당부서명
  CHRG_USER_ID: '',     // 담당자ID
  CHRG_USER_NM: '',     // 담당자명
  URL_PATH_NM: '',      // URL PARAM
  FRAME_GBN_CD: '0',    // 프레임타입 (Nexacro=0, Birst=1, Hyperion=2, GBW=3, Spotfire=4, Normal=5)
  STATE: null,          // 상태
};


// =====================================================================
// 2. Select 옵션 목록
// =====================================================================
// - signlw Select 컴포넌트에 넘기는 옵션 배열입니다.
// - { value, label } 구조를 사용합니다.
const optionLists = {
  USE_YN: [
    { value: 'Y', label: '예' },
    { value: 'N', label: '아니오' },
  ],
  MULTITAB_YN: [
    { value: 'Y', label: '예' },
    { value: 'N', label: '아니오' },
  ],
  SNOP_YN: [
    { value: 'Y', label: 'Y' },
    { value: 'N', label: 'N' },
  ],
  FRAME_GBN_CD: [
    { value: '0', label: 'Nexacro' },
    { value: '1', label: 'Birst' },
    { value: '2', label: 'Hyperion' },
    { value: '3', label: 'GBW' },
    { value: '4', label: 'Spotfire' },
    { value: '5', label: 'Normal' },
  ],
};


// =====================================================================
// 3. 메인 컴포넌트
// =====================================================================
const MenuManagement = () => {

  // 전역 로딩 스피너 on/off
  const { setLoading } = useLoading();

  // 좌측 트리에 표시할 트리 데이터 (buildMenuTree 가 반환한 형태)
  const [menuData, setMenuData] = useState([]);

  // 현재 트리에서 확장된 노드의 key Set
  // Set<string> 으로 관리해서 O(1) 조회 가능
  const [expandedMenuKeys, setExpandedMenuKeys] = useState(new Set());

  // signlw Menu 컴포넌트의 openKeys prop 에 넘길 string[]
  const [openKeys, setOpenKeys] = useState([]);

  // 우측 상세 폼에 바인딩된 데이터
  const [formData, setFormData] = useState(initialFormData);


  // -------------------------------------------------------------------
  // 3-1. 초기화: 마운트 시 메뉴 데이터 조회
  // -------------------------------------------------------------------
  useEffect(() => {
    fnInit();
  }, []);

  const fnInit = async () => {
    const treeData = await fnGetMenuData();
    setMenuData(treeData);
  };

  // -------------------------------------------------------------------
  // 3-1-1. API 응답 후 첫 번째 항목(data[0])을 우측 폼에 자동 바인딩
  // -------------------------------------------------------------------
  // - menuData 가 세팅된 직후 실행
  // - treeData[0].rawData 가 원본 flat 데이터이므로 그대로 formData 에 복사
  useEffect(() => {
    if (menuData && menuData.length > 0 && menuData[0].rawData) {
      setFormData({ ...initialFormData, ...menuData[0].rawData });
    }
  }, [menuData]);


  // -------------------------------------------------------------------
  // 3-2. 백엔드 API 호출 -> flat 리스트 -> 트리 변환
  // -------------------------------------------------------------------
  // [API 정보]
  //  - 엔드포인트 : /api/common/getCadm00301S001List
  //  - 요청방식   : POST
  //  - 요청바디   : {} (파라미터 없이 전체 조회)
  //  - 응답형태   : 아래 구조의 flat 배열 (예시)
  //    [
  //      {
  //        UPPER_FUNC_ID: '0',
  //        FUNC_ID: 'R001',
  //        KOR_FUNC_NM: '구성원용',
  //        SORT_SEQ: 1,
  //        LVL_VAL: 1,
  //        USE_YN: 'Y',
  //        ... (initialFormData 와 동일한 필드)
  //      },
  //      ...
  //    ]
  //
  // [주의]
  //  - 실제 응답이 response.data 가 아닌 response.data.list 등 다른 경로이면
  //    아래 "const data = response.data;" 부분만 수정하면 됩니다.
  const fnGetMenuData = async () => {
    try {
      setLoading(true);

      const response = await axiosUtil.post(
        '/api/common/getCadm00301S001List',
        {},
      );

      setLoading(false);

      // 응답 데이터 경로 확인 후 수정
      const data = response.data;

      // flat 리스트를 트리 구조로 변환
      const menuTree = buildMenuTree(data);
      return menuTree;

    } catch (error) {
      setLoading(false);
      console.error('메뉴 데이터 조회 실패', error);
      return [];
    }
  };


  // -------------------------------------------------------------------
  // 3-3. flat 리스트 -> signlw Menu 용 트리 구조로 변환
  // -------------------------------------------------------------------
  // [반환 형태]
  //  [
  //    {
  //      key: 'R001',               // FUNC_ID (Menu.Item / Menu.SubMenu key)
  //      title: '구성원용',          // KOR_FUNC_NM (트리에 표시되는 텍스트)
  //      rawData: { ...원본 row },   // 트리 클릭 시 폼에 바인딩할 원본 데이터
  //      children: [ ... ]          // 하위 노드 (없으면 빈 배열)
  //    },
  //    ...
  //  ]
  const buildMenuTree = (menuItems) => {
    if (!menuItems || menuItems.length === 0) return [];

    // func_id 를 key 로 하는 Map 생성
    const itemMap = {};
    menuItems.forEach((item) => {
      itemMap[item.FUNC_ID] = {
        key: item.FUNC_ID,
        title: item.KOR_FUNC_NM || item.EN_FUNC_NM || item.FUNC_ID,
        rawData: { ...item },
        children: [],
      };
    });

    // UPPER_FUNC_ID 로 부모-자식 관계 구성
    const rootItems = [];
    menuItems.forEach((item) => {
      const currentNode = itemMap[item.FUNC_ID];
      if (item.UPPER_FUNC_ID && itemMap[item.UPPER_FUNC_ID]) {
        itemMap[item.UPPER_FUNC_ID].children.push(currentNode);
      } else {
        // 부모가 없거나 '0' 이면 루트
        rootItems.push(currentNode);
      }
    });

    // 각 레벨 정렬 (SORT_SEQ 오름차순)
    const sortNodes = (nodes) => {
      nodes.sort((a, b) => {
        return (a.rawData?.SORT_SEQ || 0) - (b.rawData?.SORT_SEQ || 0);
      });
      nodes.forEach((node) => {
        if (node.children && node.children.length > 0) {
          sortNodes(node.children);
        }
      });
    };

    sortNodes(rootItems);
    return rootItems;
  };


  // -------------------------------------------------------------------
  // 3-4. 트리 노드 클릭 -> 우측 폼 바인딩
  // -------------------------------------------------------------------
  // - signlw Menu.Item 클릭 시 호출됩니다.
  // - rawData (API 원본 필드) 를 formData 에 그대로 세팅합니다.
  const handleMenuSelect = ({ key }) => {
    const findNode = (nodes) => {
      for (const node of nodes) {
        if (node.key === key) return node;
        if (node.children && node.children.length > 0) {
          const found = findNode(node.children);
          if (found) return found;
        }
      }
      return null;
    };

    const targetNode = findNode(menuData);
    if (targetNode && targetNode.rawData) {
      setFormData({ ...initialFormData, ...targetNode.rawData });
    }
  };


  // -------------------------------------------------------------------
  // 3-5. 트리 노드 +/- 토글 (확장/축소)
  // -------------------------------------------------------------------
  const toggleMenuExpansion = (key) => {
    const newExpandedKeys = new Set(expandedMenuKeys);
    if (newExpandedKeys.has(key)) {
      newExpandedKeys.delete(key);
    } else {
      newExpandedKeys.add(key);
    }
    setExpandedMenuKeys(newExpandedKeys);
    setOpenKeys(Array.from(newExpandedKeys));
  };


  // -------------------------------------------------------------------
  // 3-6. 폼 필드 값 업데이트
  // -------------------------------------------------------------------
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };


  // -------------------------------------------------------------------
  // 3-7. 돋보기 버튼 클릭 이벤트 핸들러
  //
  // ▶ 호출 위치 (렌더링 파트):
  //   - 상위기능ID 옆  : <IconButton onClick={() => handleSearch('UPPER_FUNC_ID')}>
  //   - 프로그램ID 옆  : <IconButton onClick={() => handleSearch('PROG_ID')}>
  //   - 담당부서 옆    : <IconButton onClick={() => handleSearch('CHRG_DEPT_CD')}>
  //   - 담당자 옆      : <IconButton onClick={() => handleSearch('CHRG_USER_ID')}>
  //
  // ▶ 현재: console.log 만 출력 (개발 중 확인용)
  //
  // ▶ 실제 연동 시 구현 방법:
  //   1) 모달 오픈 state 추가  : const [isModalOpen, setIsModalOpen] = useState(false);
  //   2) 어떤 필드의 모달인지  : const [modalTargetField, setModalTargetField] = useState('');
  //   3) handleSearch 에서 state 변경으로 모달 오픈:
  //      if (field === 'UPPER_FUNC_ID') {
  //        setModalTargetField(field);
  //        setIsModalOpen(true);          // ← 이 한 줄로 모달이 열림
  //      }
  //   4) 모달 확인 버튼에서 선택된 값을 폼에 바인딩:
  //      updateField('UPPER_FUNC_ID', selectedNode.FUNC_ID);
  //      updateField('UPPER_FUNC_NM', selectedNode.KOR_FUNC_NM);
  //   5) JSX 렌더링 파트 가장 아래에 모달 컴포넌트 배치:
  //      {isModalOpen && <UpperFuncModal onConfirm={...} onClose={...} />}
  //
  // ※ 로컬 미리보기(MenuManagementPreview.jsx)에는
  //   상위기능ID 모달이 이미 구현되어 있으니 참고하세요.
  // -------------------------------------------------------------------
  const handleSearch = (field) => {
    console.log('돋보기 클릭:', field, formData[field]);
  };


  // -------------------------------------------------------------------
  // 3-8. 삭제(초기화) 버튼 핸들러
  // -------------------------------------------------------------------
  const handleClear = (field) => {
    console.log('삭제 클릭:', field);
    updateField(field, '');
    // 부서코드 삭제 시 부서명도 같이 초기화
    if (field === 'CHRG_DEPT_CD') updateField('CHRG_DEPT_NM', '');
    // 담당자ID 삭제 시 담당자명도 같이 초기화
    if (field === 'CHRG_USER_ID') updateField('CHRG_USER_NM', '');
  };


  // -------------------------------------------------------------------
  // 3-9. 저장 버튼 핸들러 (TODO: 실제 저장 API 연결)
  // -------------------------------------------------------------------
  const handleSave = async () => {
    console.log('저장 클릭', formData);
    // TODO: axiosUtil.post('/api/common/saveCadm00301S001', formData)
  };


  // -------------------------------------------------------------------
  // 3-10. 삭제 버튼 핸들러 (TODO: 실제 삭제 API 연결)
  // -------------------------------------------------------------------
  const handleDelete = async () => {
    console.log('삭제 클릭', formData);
    // TODO: axiosUtil.post('/api/common/deleteCadm00301S001', { FUNC_ID: formData.FUNC_ID })
  };


  // -------------------------------------------------------------------
  // 3-11. 좌측 트리 메뉴 렌더링 (재귀)
  // -------------------------------------------------------------------
  // - children 이 있으면 Menu.SubMenu (펼칠 수 있는 그룹 노드)
  // - children 이 없으면 Menu.Item (말단 노드)
  const renderMenuItems = (items) => {
    return items.map((item) => {
      const isExpanded = expandedMenuKeys.has(item.key);

      if (item.children && item.children.length > 0) {
        return (
          <Menu.SubMenu
            key={item.key}
            open={isExpanded}
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {/* +/- 버튼: 클릭 시 SubMenu 자체 선택이 아닌 토글만 동작하도록 stopPropagation */}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMenuExpansion(item.key);
                  }}
                  style={{ marginRight: '6px', cursor: 'pointer', userSelect: 'none' }}
                >
                  {isExpanded ? '−' : '+'}
                </span>
                <span>{item.title}</span>
              </div>
            }
          >
            {renderMenuItems(item.children)}
          </Menu.SubMenu>
        );
      }

      return (
        <Menu.Item key={item.key}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '6px', color: '#888' }}>•</span>
            <span>{item.title}</span>
          </div>
        </Menu.Item>
      );
    });
  };


  // ===================================================================
  // 4. 렌더링
  // ===================================================================
  return (
    <Container>
      {/* 전역 스타일 초기화 */}
      <GlobalStyle />

      {/* 페이지 타이틀 영역 */}
      <HeaderMenuContainer>
        <PageTitleArea>
          <h2>기능그룹</h2>
        </PageTitleArea>
      </HeaderMenuContainer>

      <ContentContainer>
        <FlexContainer>

          {/* ── 좌측: 트리 메뉴 ─────────────────────────────── */}
          <MenuPanelWrap style={{ width: '300px', marginRight: '20px' }}>
            <Menu
              mode="inline"
              openKeys={openKeys}
              onSelect={handleMenuSelect}
              style={{ height: 'calc(100vh - 150px)', overflowY: 'auto' }}
            >
              {menuData && menuData.length > 0
                ? renderMenuItems(menuData)
                : <Menu.Item key="empty" disabled>데이터가 없습니다.</Menu.Item>
              }
            </Menu>
          </MenuPanelWrap>

          {/* ── 우측: 상세 입력 폼 ──────────────────────────── */}
          <FormContainer>
            {/* 메뉴 상세 타이틀 */}
            <Divider orientation="left">메뉴 상세</Divider>
            {/* 저장/삭제 버튼: 타이틀 바로 아래, 오른쪽 정렬 */}
            <FormButtonRow>
              <Button type="primary" onClick={handleSave}>저장</Button>
              <Button onClick={handleDelete} style={{ marginLeft: '8px' }}>삭제</Button>
            </FormButtonRow>

            {/*
              ── 상위기능ID ──────────────────────────────────────────
              🔍 버튼 클릭 → handleSearch('UPPER_FUNC_ID') 호출
              → 실제 연동 시: 모달 오픈 → 선택 → UPPER_FUNC_ID / UPPER_FUNC_NM 바인딩
              (모달 구현 참고: MenuManagementPreview.jsx 의 isModalOpen 파트)
            */}
            <FormRow>
              <FormLabel>상위기능ID</FormLabel>
              <FormFieldGroup>
                <TextField
                  value={formData.UPPER_FUNC_ID ?? ''}
                  onChange={(e) => updateField('UPPER_FUNC_ID', e.target.value)}
                  style={{ flex: 1 }}
                />
                {/* ↓ 돋보기 클릭 이벤트 → handleSearch 로 연결 */}
                <IconButton onClick={() => handleSearch('UPPER_FUNC_ID')}>🔍</IconButton>
                {/* 상위기능명: 모달에서 선택 시 자동 바인딩 */}
                <TextField
                  value={formData.UPPER_FUNC_NM ?? ''}
                  onChange={(e) => updateField('UPPER_FUNC_NM', e.target.value)}
                  style={{ flex: 1 }}
                />
              </FormFieldGroup>
            </FormRow>

            {/* 기능ID */}
            <FormRow>
              <FormLabel>기능ID</FormLabel>
              <FormFieldGroup>
                <TextField
                  value={formData.FUNC_ID ?? ''}
                  onChange={(e) => updateField('FUNC_ID', e.target.value)}
                  style={{ flex: 1 }}
                />
              </FormFieldGroup>
            </FormRow>

            {/* 기능레벨 */}
            <FormRow>
              <FormLabel>기능레벨</FormLabel>
              <FormFieldGroup>
                <TextField
                  value={formData.LVL_VAL ?? ''}
                  onChange={(e) => updateField('LVL_VAL', e.target.value)}
                  style={{ flex: 1 }}
                />
              </FormFieldGroup>
            </FormRow>

            {/* 영문기능명 + 메뉴버튼크기 */}
            <FormRow>
              <FormLabel>영문기능명</FormLabel>
              <FormFieldGroup>
                <TextField
                  value={formData.EN_FUNC_NM ?? ''}
                  onChange={(e) => updateField('EN_FUNC_NM', e.target.value)}
                  style={{ flex: 1 }}
                />
                <InlineLabel>메뉴버튼크기</InlineLabel>
                <TextField
                  value={formData.EN_FUNC_NM_SIZE ?? ''}
                  onChange={(e) => updateField('EN_FUNC_NM_SIZE', e.target.value)}
                  style={{ width: '70px' }}
                />
              </FormFieldGroup>
            </FormRow>

            {/* 한글기능명 */}
            <FormRow>
              <FormLabel>한글기능명</FormLabel>
              <FormFieldGroup>
                <TextField
                  value={formData.KOR_FUNC_NM ?? ''}
                  onChange={(e) => updateField('KOR_FUNC_NM', e.target.value)}
                  style={{ flex: 1 }}
                />
              </FormFieldGroup>
            </FormRow>

            {/* 프로그램ID + 돋보기 + 프로그램명 */}
            <FormRow>
              <FormLabel>프로그램ID</FormLabel>
              <FormFieldGroup>
                <TextField
                  value={formData.PROG_ID ?? ''}
                  onChange={(e) => updateField('PROG_ID', e.target.value)}
                  style={{ flex: 1 }}
                />
                <IconButton onClick={() => handleSearch('PROG_ID')}>🔍</IconButton>
                <FormInlineText>{formData.PROG_NM}</FormInlineText>
              </FormFieldGroup>
            </FormRow>

            {/* 정렬순서 */}
            <FormRow>
              <FormLabel>정렬순서</FormLabel>
              <FormFieldGroup>
                <TextField
                  value={formData.SORT_SEQ ?? ''}
                  onChange={(e) => updateField('SORT_SEQ', e.target.value)}
                  style={{ flex: 1 }}
                />
              </FormFieldGroup>
            </FormRow>

            {/* 사용여부: Y/N 두 값만 있어 Select 대신 Radio.Group 으로 변경 */}
            <FormRow>
              <FormLabel>사용여부</FormLabel>
              <FormFieldGroup>
                <Radio.Group
                  value={formData.USE_YN}
                  onChange={(e) => updateField('USE_YN', e.target.value)}
                >
                  <Radio value="Y">예</Radio>
                  <Radio value="N">아니오</Radio>
                </Radio.Group>
              </FormFieldGroup>
            </FormRow>

            {/* 멀티탭여부: Y/N 두 값만 있어 Select 대신 Radio.Group 으로 변경 */}
            <FormRow>
              <FormLabel>멀티탭여부</FormLabel>
              <FormFieldGroup>
                <Radio.Group
                  value={formData.MULTITAB_YN}
                  onChange={(e) => updateField('MULTITAB_YN', e.target.value)}
                >
                  <Radio value="Y">예</Radio>
                  <Radio value="N">아니오</Radio>
                </Radio.Group>
              </FormFieldGroup>
            </FormRow>

            {/* 담당부서 */}
            <FormRow>
              <FormLabel>담당부서</FormLabel>
              <FormFieldGroup>
                <TextField
                  value={formData.CHRG_DEPT_CD ?? ''}
                  onChange={(e) => updateField('CHRG_DEPT_CD', e.target.value)}
                  style={{ flex: 1 }}
                />
                <IconButton onClick={() => handleSearch('CHRG_DEPT_CD')}>🔍</IconButton>
                <IconButton onClick={() => handleClear('CHRG_DEPT_CD')}>✕</IconButton>
              </FormFieldGroup>
            </FormRow>

            {/* 담당자 */}
            <FormRow>
              <FormLabel>담당자</FormLabel>
              <FormFieldGroup>
                <TextField
                  value={formData.CHRG_USER_ID ?? ''}
                  onChange={(e) => updateField('CHRG_USER_ID', e.target.value)}
                  style={{ flex: 1 }}
                />
                <IconButton onClick={() => handleSearch('CHRG_USER_ID')}>🔍</IconButton>
                <IconButton onClick={() => handleClear('CHRG_USER_ID')}>✕</IconButton>
              </FormFieldGroup>
            </FormRow>

            {/* URL PARAM */}
            <FormRow>
              <FormLabel>URL PARAM</FormLabel>
              <FormFieldGroup>
                <TextField
                  value={formData.URL_PATH_NM ?? ''}
                  onChange={(e) => updateField('URL_PATH_NM', e.target.value)}
                  style={{ flex: 1 }}
                />
              </FormFieldGroup>
            </FormRow>

            {/* S&OP여부 + 프레임타입: 한 행에 나란히 배치 (공간 절약) */}
            <FormRow>
              <FormLabel>S&amp;OP여부</FormLabel>
              <FormFieldGroup>
                <Select
                  value={formData.SNOP_YN}
                  options={optionLists.SNOP_YN}
                  onChange={(value) => updateField('SNOP_YN', value)}
                  style={{ width: '140px' }}
                />
                <InlineLabel>프레임타입</InlineLabel>
                <Select
                  value={String(formData.FRAME_GBN_CD)}
                  options={optionLists.FRAME_GBN_CD}
                  onChange={(value) => updateField('FRAME_GBN_CD', value)}
                  style={{ width: '160px' }}
                />
              </FormFieldGroup>
            </FormRow>

          </FormContainer>

        </FlexContainer>
      </ContentContainer>

    </Container>
  );
};

export default MenuManagement;


// =====================================================================
// 5. styled-components (폼 내부 레이아웃 전용)
// =====================================================================
// - Container / FlexContainer / MenuPanelWrap 등 큰 레이아웃은
//   회사 CustStyled 를 그대로 사용하고,
// - 우측 상세 폼 내부의 행(row) / 레이블 / 인라인 버튼 등
//   CustStyled 에 없는 세부 요소만 여기서 추가 정의합니다.

// 우측 상세 폼 전체 래퍼
// - flex:1 로 남은 공간을 채우고, 내용이 길면 세로 스크롤
const FormContainer = styled.div`
  flex: 1;
  padding: 0 16px 16px 16px;
  overflow-y: auto;
  font-size: 12px;
`;

// 각 입력 항목 한 줄 (레이블 130px 고정 + 입력영역 나머지)
// 인풋 너비를 줄이려면 여기서 grid-template-columns 첫번째 값(130px)을 조정
// 또는 각 TextField 에 style={{ width: '원하는px' }} 을 직접 추가
const FormRow = styled.div`
  display: grid;
  grid-template-columns: 130px 1fr;
  align-items: center;
  column-gap: 8px;
  margin-bottom: 8px;
`;

// 항목명 레이블 (좌측 고정 컬럼)
const FormLabel = styled.div`
  font-size: 12px;
  color: #555;
  font-weight: 500;
`;

// 입력 컨트롤들을 가로로 나열하는 컨테이너
// TextField + 돋보기버튼 + 인라인텍스트 등을 묶을 때 사용
const FormFieldGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

// 돋보기 버튼 오른쪽에 읽기전용으로 표시되는 명칭 텍스트
// 예) 상위기능ID 옆 상위기능명, 프로그램ID 옆 프로그램명
const FormInlineText = styled.span`
  font-size: 12px;
  color: #333;
  margin-left: 4px;
`;

// 한 FieldGroup 안에서 두 항목을 구분하는 중간 레이블
// 예) S&OP여부 [콤보] 프레임타입 [콤보] 처럼 같은 행에 나란히 놓을 때 사용
const InlineLabel = styled.span`
  font-size: 12px;
  color: #555;
  margin: 0 4px;
  white-space: nowrap;
`;

// 돋보기(🔍) / 삭제(✕) 아이콘 버튼
// - 실제 기능은 handleSearch / handleClear 에서 처리
// - TODO: 실제 연동 시 팝업 모달 연결 필요
const IconButton = styled.button`
  width: 24px;
  height: 24px;
  padding: 0;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  background: #fafafa;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &:hover {
    background: #e6f0ff;
    border-color: #4c77bf;
  }

  &:active {
    background: #d0e4ff;
  }
`;

// 저장 / 삭제 버튼: 타이틀 바로 아래, 오른쪽 정렬
const FormButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 8px;
`;

